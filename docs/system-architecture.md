# System Architecture

## High-Level Overview

SnapKit is a serverless multi-brand thumbnail generator on Cloudflare Workers. Modular routing dispatches requests to handlers → data layers (brands, sizes, layouts) → utility services (R2, Unsplash, Windmill). Live preview in browser via client-side state, PNG export client-side (snapdom) or server-side (Windmill/CamoFox).

```
User Browser Request
        ↓
Cloudflare Worker (src/index.ts)
        ↓
Route Dispatcher (modular handlers)
        ↓
Response Layers:
  - UI: builder.ts → HTML/CSS/JS
  - API: sizes, layouts, brands, backgrounds, designs, search, render, generate
        ↓
Data Sources:
  - Presets: size-presets.ts, brand-kits.ts, gradient-presets.ts
  - Storage: R2 bucket (designs, backgrounds, exports)
  - External: Unsplash API, Windmill API
        ↓
PNG Export Paths:
  - Client: snapdom (browser-side capture)
  - Server: Windmill/CamoFox (high-quality server-side render)
        ↓
Browser Download or Share Link
```

## Worker Architecture

### Entry Point: src/index.ts (120 LOC)

Single `fetch(request, env)` handler with route logic:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') return corsResponse();

    // UI Routes
    if (path === '/' || path === '') return handleBuilder();
    if (path.startsWith('/d/')) return handleDesignView(designId, env);

    // API Routes
    if (path === '/api/sizes') return handleSizes();
    if (path === '/api/layouts') return handleLayouts(url);
    if (path.startsWith('/api/brands')) return handleBrandsRoute(request, env, path);
    if (path === '/api/designs' && method === 'POST') return handleDesignCreate(request, env);
    if (path.startsWith('/api/designs/') && method === 'GET') return handleDesignGet(designId, env);
    if (path.startsWith('/api/designs/') && method === 'PUT') return handleDesignUpdate(designId, request, env);
    if (path === '/api/render') return handleRender(url, env);
    if (path === '/api/generate' && method === 'POST') return handleGenerate(request, env);
    if (path === '/api/backgrounds') return handleBackgrounds(url, env);
    if (path === '/api/backgrounds/upload' && method === 'POST') return handleBackgroundUpload(request, env);
    if (path === '/api/search') return handleImageSearch(url, env);

    return notFoundResponse();
  }
}
```

**Routing Strategy**:
- Exact match for UI routes (`/`, `/d/:id`)
- Path prefix match for API `/api/*` with method checking
- Query parameters for filtering (category, source, query)
- Error handling: 404 for unmatched paths, CORS preflight for `OPTIONS`

### Environment (Env Interface)

```typescript
interface Env {
  R2_BUCKET: R2Bucket;              // Cloudflare R2 storage
  UNSPLASH_ACCESS_KEY?: string;     // Unsplash API key
  WINDMILL_BASE?: string;           // Windmill API endpoint
  WINDMILL_TOKEN?: string;          // Windmill authentication
  WINDMILL_WORKSPACE?: string;      // Windmill workspace ID
}
```

Injected via `wrangler secret` before deployment.

## Route Handlers

### GET / → builder.ts (HTML SPA)

Returns 28 KB HTML document with:
- **CSS**: Dark theme (#0f0f1a), responsive grid (sidebar + preview)
- **HTML**: Header, controls, preview area
- **JavaScript**: State management, event binding, API integration

On load:
1. Fetch /api/sizes, /api/layouts, /api/brands
2. Populate dropdowns from responses
3. Initialize state with defaults
4. Attach event listeners to controls

Controls:
- Size dropdown → state.size, re-render preview
- Layout dropdown → state.layout, re-render with layout's params
- Brand dropdown → state.brand, re-render with brand colors/fonts
- Background source (Unsplash/gradient/upload) → state.bg_image/bg_color
- Text inputs (title, subtitle) → state.title/subtitle, debounced re-render
- Color pickers → state.colors, immediate re-render
- Save design button → POST /api/designs, get shareable link
- Download button → client-side snapdom capture or POST /api/generate

### GET /api/sizes

```typescript
export function handleSizes(): Response {
  return jsonResponse(SIZE_PRESETS);
}
```

Returns array of 12 size presets (fb-post, ig-post, yt-thumbnail, etc.) with id, name, w, h, category.

### GET /api/layouts?category=...

```typescript
const layouts = Object.values(LAYOUTS).map(l => ({
  id: l.id,
  name: l.name,
  categories: l.categories,
  params: l.params,
}));
if (category) {
  return jsonResponse(layouts.filter(l => l.categories.includes(category)));
}
return jsonResponse(layouts);
```

Returns 8 layout templates, filtered by category if provided (landscape, square, portrait, wide).

### GET /api/brands, /api/brands/:id, /api/brands/:id/assets → brands.ts

- **GET /api/brands**: List of 3 brands (GOHA, Tony's Friends, Vibery) with id, name, colors
- **GET /api/brands/:id**: Full brand kit (colors, fonts, logos, backgrounds, watermark)
- **GET /api/brands/:id/assets**: Logos and backgrounds URLs only

### GET /api/backgrounds?source=unsplash|gradient|uploaded&query=... → backgrounds.ts

Dispatches to 3 sources:
1. **Unsplash**: searchUnsplash(query) → 20 images with URLs, metadata
2. **Gradients**: gradient-presets.ts → predefined gradients
3. **Uploaded**: listR2(designs/backgrounds/) → user-uploaded backgrounds

Returns array of background objects with url, name, source, tags.

### POST /api/backgrounds/upload → backgrounds.ts

Multipart form:
- `file` (image)
- `name` (optional, generated if omitted)

Saves to R2 `designs/backgrounds/{uuid}.{ext}`, returns URL.

### GET /api/search?q=... → image-search.ts

Wrapper around Unsplash API using UNSPLASH_ACCESS_KEY. Returns images with full URLs, metadata. Used in builder to preview search results before applying to design.

### POST /api/designs → designs.ts

**Request body** (JSON):
```json
{
  "size_id": "fb-post",
  "layout_id": "overlay-center",
  "brand_id": "goha",
  "title": "...",
  "subtitle": "...",
  "colors": { "title_color": "#FFF", ... },
  "images": { "bg_image": "url", ... }
}
```

**Response**:
```json
{
  "id": "design-uuid-...",
  "created_at": "2025-02-26T...",
  "url": "/d/design-uuid-..."
}
```

Saves to R2 `designs/{id}.json`, returns ID and shareable link.

### GET /api/designs/:id → designs.ts

Retrieves design JSON from R2. Returns full design object with all settings.

### PUT /api/designs/:id → designs.ts

Updates design in R2. Merges new fields with existing design, overwrites R2 object.

### GET /d/:id → design-viewer.ts (HTML SPA)

Similar to builder, but:
- Reads design from R2
- Renders as read-only preview
- Buttons: "Download", "Edit in Builder", "Share Link"
- No edit controls (can export only)

### GET /api/render?design={json} → render.ts

Query parameter passes design JSON (URL-encoded). Returns HTML string suitable for snapdom capture:
```html
<html>
  <style>/* @font-face + fonts + layout styles */</style>
  <body>
    <div id="thumbnail"><!-- layout.render() output --></div>
  </body>
</html>
```

Used by builder to test capture before full download.

### POST /api/generate → generate.ts (Server-Side Export)

**Request body**:
```json
{
  "size_id": "fb-post",
  "layout_id": "overlay-center",
  "title": "...",
  "title_color": "#FFF",
  ... (all design params)
}
```

**Process**:
1. Compute cache key hash from design
2. Check export-cache.ts in R2 export-cache/{hash}.png
3. If hit: return cached PNG
4. If miss: call windmill-client.ts → POST to Windmill API
5. Windmill runs CamoFox to render design HTML → PNG
6. Save to R2 export-cache/{hash}.png (TTL 7 days)
7. Return PNG blob

**Error Handling**: Try/catch, return 500 with error message if Windmill unavailable.

## Data Layer

### Size Presets (src/data/size-presets.ts)

```typescript
export const SIZE_PRESETS: SizePreset[] = [
  // Landscape
  { id: 'fb-post', name: 'Facebook Post', w: 1200, h: 630, category: 'landscape' },
  // ... 11 more
];

export function getSizeById(id: string): SizePreset | undefined { ... }
export function getSizesByCategory(category: 'landscape' | 'square' | 'portrait' | 'wide'): SizePreset[] { ... }
export function createCustomSize(w: number, h: number): SizePreset { ... }
```

12 presets: 7 landscape, 1 square, 2 portrait, 2 wide. Auto-categorizes custom sizes by aspect ratio.

### Brand Kits (src/data/brand-kits.ts)

```typescript
export const BRANDS: Record<string, BrandKit> = {
  goha: {
    id: 'goha',
    name: 'GOHA',
    colors: { primary, secondary, accent, text_light, text_dark },
    fonts: { heading: 'Montserrat', body: 'Be Vietnam Pro' },
    logos: [ { id, url, name } ],
    backgrounds: [ { url, tags, name } ],
    watermark: { url, default_opacity },
    default_text_color: '#FFFFFF',
    default_overlay: 'dark',
  },
  tonyfriends: { ... },
  vibery: { ... },
};

export function getBrandById(id: string): BrandKit | null { ... }
```

3 brands with full color palettes, fonts, logos, backgrounds. Used as fallback if R2 unavailable.

### Layouts (src/layouts/)

8 layout modules, each exports Layout interface:

```typescript
interface Layout {
  id: string;
  name: string;
  categories: ('landscape' | 'square' | 'portrait' | 'wide')[];
  params: LayoutParam[];
  render: (params: LayoutRenderParams) => string;
}
```

**Params** define what controls appear in builder (text, color, image selectors).

**render()** returns `<div id="thumbnail">...</div>` with inline styles based on params and design state.

Example (overlay-center):
- Params: title, subtitle, bg_color, title_color, subtitle_color, logo
- render(): Outputs `<div>` with centered text, background color, optional logo positioned top-right

### Gradient Presets (src/lib/gradient-presets.ts)

Predefined CSS gradients for quick background selection:
```typescript
export const GRADIENT_PRESETS = [
  { id: 'sunset', name: 'Sunset', value: 'linear-gradient(135deg, #FF6B6B 0%, #FFA06B 100%)' },
  // ... more
];
```

## Utility Services

### Design Store (src/lib/design-store.ts)

```typescript
export async function getDesign(id: string, r2: R2Bucket): Promise<Design | null>
export async function saveDesign(design: Design, r2: R2Bucket): Promise<string>
export async function updateDesign(id: string, updates: Partial<Design>, r2: R2Bucket): Promise<void>
```

R2 CRUD operations at `designs/{id}.json`. JSON format allows full design state persistence and sharing.

### R2 Helpers (src/lib/r2-helpers.ts)

```typescript
export async function getR2Object(bucket: R2Bucket, key: string): Promise<any | null>
export async function putR2Object(bucket: R2Bucket, key: string, data: any): Promise<void>
export async function deleteR2Object(bucket: R2Bucket, key: string): Promise<void>
export async function listR2Objects(bucket: R2Bucket, prefix: string): Promise<string[]>
```

Generic R2 wrappers for get/put/delete/list. Paths: designs/, backgrounds/, export-cache/.

### Unsplash Client (src/lib/unsplash.ts)

```typescript
export async function searchUnsplash(query: string, key: string): Promise<UnsplashImage[]>
```

Queries Unsplash API with UNSPLASH_ACCESS_KEY. Returns 20 images with urls.regular, user.name, description. Used by builder background search and image-search.ts route.

### Windmill Client (src/lib/windmill-client.ts)

```typescript
export async function generatePNG(design: DesignExportParams, env: Env): Promise<Blob>
```

POSTs to Windmill API with design HTML. Windmill runs CamoFox (Chromium-based renderer) to capture PNG. Returns Blob ready for download. Requires WINDMILL_BASE, WINDMILL_TOKEN, WINDMILL_WORKSPACE environment variables.

### Export Cache (src/lib/export-cache.ts)

```typescript
export async function getCachedExport(hash: string, r2: R2Bucket): Promise<Blob | null>
export async function cacheExport(hash: string, blob: Blob, r2: R2Bucket): Promise<void>
```

Deduplicates Windmill calls. Computes hash from design params, checks R2 export-cache/{hash}.png. Cache hit avoids redundant server-side generation. TTL managed via R2 lifecycle rules.

### Template Renderer (src/lib/template-renderer.ts)

```typescript
export function renderDesign(design: Design, layout: Layout): string
```

Applies chosen layout to design data. Calls `layout.render()` with design state (colors, text, images, sizes). Returns HTML suitable for PNG capture or embedding.

### HTML Helpers (src/lib/html-helpers.ts)

- `escapeHtml(str)`: Prevents XSS (replaces &, <, >, ", ')
- `isValidColor(color)`: Validates #RRGGBB format
- `sanitizeColor(color, fallback)`: Returns valid color or fallback

All user input (title, subtitle, colors) validated before rendering to HTML.

## Client-Side Rendering Flow

### Builder State Management

```javascript
const state = {
  size: SIZE_PRESETS[0],
  layout: LAYOUTS['overlay-center'],
  brand: BRANDS.goha,
  title: 'Design Title',
  subtitle: 'Subtitle text',
  colors: { title_color: '#FFF', subtitle_color: '#000', bg_color: '#1a1a3e' },
  images: { bg_image: 'https://...' },
  showLogo: true,
}
```

Mutable object updated on control change.

### render() Pipeline

1. **Get layout**: LAYOUTS[state.layout]
2. **Build params**: Extract colors, text, images from state
3. **Call layout.render(params)**: Returns HTML with inline styles
4. **Insert to DOM**: innerHTML into #preview-frame
5. **Apply scaling**: updateScale() to fit viewport

### updateScale() Logic

- Calc max width: preview element width minus padding
- Calc max height: viewport height minus controls
- Scale = min(maxW / state.width, maxH / state.height, 1)
- Apply CSS transform: scale(factor)
- Update dimension display

### Event Binding

**Text inputs** (title, subtitle): debounce(100ms) on 'input'
- Update state
- Call render()

**Color inputs**: No debounce on 'input' (discrete changes)
- Update state
- Immediate render()

**Size dropdown**: 'change' event
- Find preset, update state.size
- render() with new dimensions

**Layout dropdown**: 'change' event
- Update state.layout
- render() applies new layout, controls change

**Brand dropdown**: 'change' event
- Update state.brand
- render() applies brand colors/fonts

**Background source selector**: Fetch /api/backgrounds?source=...
- Update state.bg_image or state.bg_color
- render()

**Background upload**: POST /api/backgrounds/upload
- File → R2
- Get URL, update state.bg_image
- render()

**Window resize**: debounce(150ms) on 'resize'
- updateScale() adjusts preview scaling

**Save design**: POST /api/designs
- Send current state as JSON
- Get /d/:id link, copy to clipboard

**Download PNG**: Two paths:
- **Client**: Call snapdom on #thumbnail
  - Remove scale transform
  - snapdom(elem) → capture at 2x
  - Restore transform
  - Create blob URL, trigger download
- **Server**: POST /api/generate
  - Send design JSON to Windmill
  - Return PNG from cache or fresh render

## Error Handling

### XSS Prevention

- `escapeHtml()` on title/subtitle before rendering
- `isValidColor()` validates color input
- Inline styles only, no innerHTML from user input

### Missing Resources

- Logo image: `onerror` handler hides image
- Font load: `document.fonts.ready` before render
- Unsplash API: Return empty array if unavailable
- Windmill API: Fall back to client-side snapdom
- R2 unavailable: Use brand-kits.ts fallback data

### Network Errors

- Try/catch on all async operations (fetch, R2, Unsplash, Windmill)
- Return 500 with error message to client
- Client shows toast notification with error

## Performance

### Initial Load

- Single HTML response (~28 KB)
- No external dependencies except fonts + snapdom CDN
- Fonts loaded async with font-display: swap
- JavaScript runs DOMContentLoaded, fetches data APIs

### API Caching

- /api/sizes, /api/layouts → static responses, cacheable (immutable)
- /api/brands → static responses, cacheable
- /api/backgrounds → dynamic (search), Cache-Control: max-age=3600
- /api/designs/:id → R2 cached by default
- /api/generate → custom caching via export-cache.ts

### DOM Updates

- State mutation + render() on each change (no virtual DOM)
- debounce(100ms) on text input prevents excessive renders
- updateScale() called on resize + discrete changes (size/layout)

### R2 Storage

- designs/{id}.json: ~5-10 KB per design
- backgrounds/{uuid}.{ext}: Variable (user uploads)
- export-cache/{hash}.png: ~50-500 KB per cached export

## Deployment

### Configuration (wrangler.toml)

```toml
name = "snapkit"
main = "src/index.ts"
compatibility_date = "2024-12-01"

[dev]
port = 8787

[assets]
directory = "./public"

[[r2_buckets]]
binding = "R2_BUCKET"
bucket_name = "snapkit-storage"
```

### Environment Variables (Set via `wrangler secret`)

```bash
wrangler secret put UNSPLASH_ACCESS_KEY
wrangler secret put WINDMILL_BASE
wrangler secret put WINDMILL_TOKEN
wrangler secret put WINDMILL_WORKSPACE
```

### Local Development

```bash
npm install
npm run dev
# http://localhost:8787
```

### Production Deployment

```bash
npm run deploy
# Uploads TypeScript source, compiles, deploys to Cloudflare Workers
```

Compiled JavaScript served globally on Cloudflare edge.

## Future Enhancements

1. **User Authentication**: Optional login for design privacy
2. **Design Versioning**: Track edit history, rollback capability
3. **Batch Export**: Multiple designs in single API call
4. **Advanced Search**: Full-text search in Unsplash via Algolia
5. **Custom Fonts**: Upload and use custom font families
6. **Template Presets**: Save design as shareable template
7. **Analytics**: Track usage, popular sizes, brands, layouts
