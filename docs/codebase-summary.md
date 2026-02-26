# SnapKit Codebase Summary

## Project Structure

```
snapkit/
├── src/
│   ├── index.ts                    # Cloudflare Worker entry point (120 LOC, modular routing)
│   ├── data/
│   │   ├── size-presets.ts         # 12 size presets, getSizeById(), getSizesByCategory()
│   │   ├── brand-kits.ts           # GOHA, Tony's Friends, Vibery brands + fallback data
│   │   └── (imported by routes)
│   ├── layouts/
│   │   ├── index.ts                # LAYOUTS registry (8 exports)
│   │   ├── overlay-center.ts       # Text center, overlay logo
│   │   ├── overlay-bottom.ts       # Text bottom, image top
│   │   ├── split-left.ts           # Image left, text right
│   │   ├── split-right.ts          # Text left, image right
│   │   ├── card-center.ts          # Card container, centered
│   │   ├── text-only.ts            # Typography focused
│   │   ├── collage-2.ts            # 2-image grid
│   │   └── frame.ts                # Bordered frame
│   ├── routes/
│   │   ├── builder.ts              # GET / — builder UI HTML
│   │   ├── sizes.ts                # GET /api/sizes → SIZE_PRESETS[]
│   │   ├── brands.ts               # GET /api/brands, /api/brands/:id
│   │   ├── backgrounds.ts          # GET /api/backgrounds, POST /api/backgrounds/upload
│   │   ├── image-search.ts         # GET /api/search → Unsplash API
│   │   ├── designs.ts              # POST/GET/PUT /api/designs/:id (R2 CRUD)
│   │   ├── design-viewer.ts        # GET /d/:id — view saved design
│   │   ├── render.ts               # GET /api/render → design HTML for capture
│   │   └── generate.ts             # POST /api/generate → server-side PNG via Windmill
│   ├── lib/
│   │   ├── types.ts                # Env, SizePreset, BrandKit, Layout, Design interfaces
│   │   ├── response-helpers.ts     # jsonResponse(), corsResponse(), errorResponse()
│   │   ├── html-helpers.ts         # escapeHtml(), sanitizeColor(), isValidColor()
│   │   ├── template-renderer.ts    # renderDesign() — applies layout + styles
│   │   ├── design-store.ts         # getDesign(), saveDesign(), updateDesign() (R2)
│   │   ├── r2-helpers.ts           # R2 bucket operations (get, put, delete, list)
│   │   ├── unsplash.ts             # searchUnsplash() — image search client
│   │   ├── windmill-client.ts      # Windmill API client for server-side export
│   │   ├── export-cache.ts         # Cache PNG exports in R2 (deduplication)
│   │   ├── design-utils.ts         # Design state helpers
│   │   └── gradient-presets.ts     # Predefined gradient backgrounds
├── public/
│   ├── fonts/
│   │   ├── Montserrat-Bold.woff2, Montserrat-ExtraBold.woff2
│   │   └── BeVietnamPro-Regular.woff2, BeVietnamPro-SemiBold.woff2
│   └── brands/
│       ├── goha/logos/ (white, dark, icon SVGs)
│       ├── tonyfriends/logos/
│       └── vibery/logos/
├── wrangler.toml                   # Worker config (TypeScript, R2 bucket binding)
├── tsconfig.json                   # TypeScript configuration
├── package.json                    # Dependencies, build scripts
├── .repomixignore                  # Excluded from repomix output
├── .gitignore                      # Standard Node.js rules
└── docs/                           # Documentation files
```

## File Descriptions

### src/index.ts (120 LOC)

**Purpose**: Cloudflare Worker entry point with modular routing to handlers.

**Routes**:
- `GET /` → builder UI
- `GET /d/:id` → design viewer
- `GET /api/sizes` → size presets
- `GET /api/layouts` → layout templates (filtered by category)
- `GET /api/brands`, `/api/brands/:id`, `/api/brands/:id/assets` → brand data
- `POST /api/designs` → create design (save to R2)
- `GET /api/designs/:id` → retrieve design
- `PUT /api/designs/:id` → update design
- `GET /api/render` → render design HTML for screenshot
- `POST /api/generate` → server-side PNG export via Windmill
- `GET /api/backgrounds` → list backgrounds (Unsplash, gradients, uploaded)
- `POST /api/backgrounds/upload` → upload background to R2
- `GET /api/search` → search Unsplash images

**Error Handling**: CORS preflight, 404 for unmatched paths, error responses delegated to handlers.

### src/data/size-presets.ts

**Exports**:
- `SIZE_PRESETS`: 12 presets across 4 categories
  - Landscape: fb-post, og-image, zalo-post, tw-post, yt-thumbnail, blog-hero, ig-landscape
  - Square: ig-post
  - Portrait: fb-story, ig-story
  - Wide: fb-cover, yt-banner
- `getSizeById(id)`, `getSizesByCategory(category)`, `createCustomSize(w, h)`

### src/data/brand-kits.ts

**Exports**:
- `BRANDS`: Record of 3 brands (GOHA, Tony's Friends, Vibery)
  - Each: id, name, colors (5), fonts, logos (array), backgrounds (array), watermark, defaults
- Used as fallback when R2 brand assets unavailable

### src/layouts/ (8 layouts)

Each exports a Layout object with:
- `id`, `name`, `categories` (which size categories support it)
- `params`: Array of control definitions (text, color, image, select)
- `render(params)`: Returns thumbnail HTML with inline styles

**Layouts**:
1. overlay-center: Logo + text centered
2. overlay-bottom: Image/gradient top, text bottom
3. split-left: Image left, text right
4. split-right: Text left, image right
5. card-center: Card container style
6. text-only: Typography focused, no image
7. collage-2: 2-image grid with text
8. frame: Bordered frame around content

### src/routes/builder.ts

Returns HTML SPA with:
- Inline CSS: Dark theme, responsive layout, component styling
- Embedded JavaScript: State management, event binding, real-time preview
- Loads SIZE_PRESETS, BRANDS, LAYOUTS from API on initialization
- Controls: Size/layout/brand dropdowns, text inputs, color pickers, background selectors
- Preview area with live scaling

### src/routes/sizes.ts

Exports SIZE_PRESETS via `GET /api/sizes`.

### src/routes/brands.ts

Routes:
- `GET /api/brands` → all brands (name, id, colors)
- `GET /api/brands/:id` → single brand kit
- `GET /api/brands/:id/assets` → logos, backgrounds, watermark URLs

### src/routes/backgrounds.ts

- `GET /api/backgrounds?source=unsplash|gradient|uploaded&query=...` → search/list
- `POST /api/backgrounds/upload` → save to R2 designs/backgrounds/
- Integrates Unsplash API + gradient presets + user uploads

### src/routes/image-search.ts

- `GET /api/search?q=...` → Unsplash API wrapper
- Returns images with URLs for use in designs

### src/routes/designs.ts (CRUD)

- `POST /api/designs` → save design to R2 (designs/{id}.json)
- `GET /api/designs/:id` → retrieve from R2
- `PUT /api/designs/:id` → update design

### src/routes/design-viewer.ts

- `GET /d/:id` → retrieve design from R2, render as HTML SPA (shareable link)

### src/routes/render.ts

- `GET /api/render?design={json}` → render design HTML for browser capture (snapdom)

### src/routes/generate.ts

- `POST /api/generate` → server-side PNG export
- Calls Windmill API with design params
- Returns PNG blob or error
- Caches exports in R2 to reduce redundant generation

### src/lib/ (Core Utilities)

**types.ts**: Env, SizePreset, BrandKit, Layout, LayoutRenderParams, Design interfaces

**response-helpers.ts**: jsonResponse(), corsResponse(), errorResponse() wrappers

**html-helpers.ts**: escapeHtml(), isValidColor(), sanitizeColor() for XSS prevention

**template-renderer.ts**: renderDesign() applies chosen layout + styles to design data

**design-store.ts**: getDesign(), saveDesign(), updateDesign() from/to R2 bucket

**r2-helpers.ts**: R2 operations (get, put, delete, list by prefix)

**unsplash.ts**: searchUnsplash() — queries Unsplash API with UNSPLASH_ACCESS_KEY

**windmill-client.ts**: Windmill API client (POST to generate PNG server-side via CamoFox)

**export-cache.ts**: Cache PNG exports in R2 to avoid duplicate Windmill calls

**design-utils.ts**: Design state helpers (merge, validate)

**gradient-presets.ts**: Predefined gradients for quick background selection

## Data Flow

### Builder Initialization
1. GET / → builder.ts returns HTML/CSS/JS bundle
2. DOMContentLoaded fires, JavaScript runs:
   - Fetch /api/sizes, /api/layouts, /api/brands
   - Populate dropdown menus
   - Initialize state with defaults
   - Attach event listeners

### Design Creation
1. User edits preview in builder
2. State updates (title, subtitle, colors, image, layout, size)
3. render() rebuilds preview HTML, applies scaling
4. On save: POST /api/designs → design-store.ts → save to R2 designs/ folder

### Design Sharing
1. Save generates ID
2. User shares /d/:id link
3. design-viewer.ts fetches design from R2
4. Renders as read-only SPA with view/download options

### PNG Export (Client)
1. User clicks "Download PNG"
2. Call snapdom on thumbnail element
3. Convert to blob at 2x resolution
4. Trigger browser download

### PNG Export (Server)
1. User clicks "Generate via Server"
2. POST /api/generate with design JSON
3. generate.ts calls Windmill API (CamoFox)
4. Windmill renders design HTML → PNG
5. Cache result in R2 export-cache/
6. Return PNG blob to client

### Background Sources
- **Unsplash**: Query /api/search → unsplash.ts → UNSPLASH_ACCESS_KEY
- **Gradients**: /api/backgrounds?source=gradient → gradient-presets.ts
- **Uploaded**: /api/backgrounds/upload → save to R2 designs/backgrounds/
- **Brand**: /api/brands/:id/assets → brand backgrounds from brand-kits.ts

## Key Patterns

### Modular Routing
- index.ts dispatches to route handlers
- Each handler independent, returns Response
- Minimal routing logic in main file

### Data Persistence
- R2 bucket: designs/{id}.json, backgrounds/{id}, export-cache/{hash}.png
- Fallback data: brand-kits.ts if R2 unavailable
- No database required

### API Design
- RESTful routes (/api/resource/:id)
- JSON request/response bodies
- Error responses include status codes and messages

### HTML Rendering
- All layouts use inline styles for capture reliability
- escapeHtml() prevents XSS on user input
- isValidColor() validates hex colors

### TypeScript
- All source files .ts with strict typing
- Interfaces defined in lib/types.ts
- wrangler.ts for Worker environment types

## Deployment

### Local Development
```bash
npm run dev
# Starts wrangler dev server on http://localhost:8787
```

### Production
```bash
npm run deploy
# Deploys to Cloudflare Workers
# Requires UNSPLASH_ACCESS_KEY, WINDMILL_TOKEN, WINDMILL_BASE secrets
```

### R2 Bucket Setup
In wrangler.toml: `bucket_name = "snapkit-storage"`
Stores: designs, backgrounds, export cache, brand assets

### Environment Variables
- `UNSPLASH_ACCESS_KEY` — Unsplash image search
- `WINDMILL_BASE` — Windmill API endpoint (for CamoFox)
- `WINDMILL_TOKEN` — Windmill authentication
- `WINDMILL_WORKSPACE` — Windmill workspace ID

## Metrics

- **Total TypeScript files**: 30+ across routes, layouts, lib
- **Lines of code**: ~2000 (modular structure)
- **Dependencies**: snapdom (client), wrangler (dev)
- **Bundle size**: Estimated 100-150 KB (TypeScript + assets)
- **API endpoints**: 12 routes (builder, data, CRUD, export, search)
- **Layouts**: 8 responsive templates
- **Size presets**: 12 across 4 categories
- **Brands**: 3 (GOHA, Tony's Friends, Vibery)

## Known Limitations

1. TypeScript compilation required for deployment
2. No built-in user authentication (open access)
3. R2 bucket name hardcoded in wrangler.toml
4. Windmill integration optional (client-side snapdom fallback)
5. No design versioning or audit log
