# PRD: snap.vibery.app — Multi-Brand Thumbnail Generator

## Overview

A multi-brand thumbnail generator and template builder at `snap.vibery.app`. Users pick a size preset, choose a layout, apply brand kits, customize text and images, then export pixel-perfect thumbnails. Designs are saveable as shareable URLs. Supports both interactive UI and server-side API generation via CamoFox.

---

## Problem

Multiple brands (GOHA, Tony's Friends, Vibery, etc.) need consistent thumbnails at scale across different platforms (Facebook, blog OG, Instagram, YouTube, etc.). Canva/Figma is overkill — teams just need to pick a size, pick a layout, apply brand styles, drop in text + images, and export.

## Solution

A template **builder** (not just renderer) with:
1. **Size presets** — Platform-specific dimensions, one click
2. **Pre-defined layouts** — Structural skeletons per size category
3. **Brand kits** — Colors, fonts, logos, curated backgrounds per brand
4. **Smart backgrounds** — Upload, brand library, random from store, Unsplash, solid/gradient
5. **Simple customization** — Text, colors, overlay, logo position, watermark
6. **Save & share** — Designs stored as JSON in R2, accessible via shareable URL
7. **Dual export** — snapdom client-side + CamoFox server-side API

---

## Size Presets

### Platform Sizes

| Preset ID | Platform | Use Case | Dimensions | Aspect Ratio |
|-----------|----------|----------|------------|-------------|
| `fb-post` | Facebook | Post image | 1200×630 | 1.91:1 |
| `fb-cover` | Facebook | Cover photo | 1640×924 | 16:9 |
| `fb-story` | Facebook | Story | 1080×1920 | 9:16 |
| `ig-post` | Instagram | Square post | 1080×1080 | 1:1 |
| `ig-story` | Instagram | Story/Reel cover | 1080×1920 | 9:16 |
| `ig-landscape` | Instagram | Landscape post | 1080×566 | 1.91:1 |
| `yt-thumbnail` | YouTube | Video thumbnail | 1280×720 | 16:9 |
| `yt-banner` | YouTube | Channel banner | 2560×1440 | 16:9 |
| `og-image` | Website | OG meta image | 1200×630 | 1.91:1 |
| `blog-hero` | Website | Blog hero banner | 1600×900 | 16:9 |
| `tw-post` | Twitter/X | Post image | 1200×675 | 16:9 |
| `zalo-post` | Zalo | Article share | 1200×630 | 1.91:1 |
| `custom` | Any | User-defined | Custom W×H | Any |

### Size Categories

Layouts are compatible with size **categories** (by aspect ratio), not individual presets:

| Category | Aspect Ratios | Presets |
|----------|--------------|---------|
| `landscape` | ~16:9, 1.91:1 | fb-post, og-image, yt-thumbnail, blog-hero, tw-post, zalo-post |
| `square` | 1:1 | ig-post |
| `portrait` | 9:16 | fb-story, ig-story |
| `wide` | Ultra-wide | fb-cover, yt-banner |

A layout designed for `landscape` works with any landscape preset — it just scales.

---

## Architecture

```
┌───────────────────────────────────────────────────────┐
│              Cloudflare Worker (snap.vibery.app)         │
│                                                       │
│  /                         → Template Builder UI      │
│  /d/:id                    → View saved design        │
│  /api/render?d=DESIGN_ID   → Render saved design      │
│  /api/render?...params     → Render inline params      │
│  /api/generate             → Server-side via CamoFox  │
│  /api/layouts              → List layouts              │
│  /api/sizes                → List size presets         │
│  /api/brands               → List brands + kits       │
│  /api/brands/:id/assets    → Brand asset library      │
│  /api/backgrounds          → Background store query   │
│  /api/designs              → Save design              │
│  /api/designs/:id          → Get design JSON          │
│  /api/search/images        → Unsplash/Pexels proxy    │
│                                                       │
│  Storage: R2                                          │
│  Fonts: self-hosted /fonts/                           │
└──────────┬────────────────────────────────────────────┘
           │
           │ POST /api/generate
           │ (calls Windmill API)
           ▼
┌───────────────────────────────────────────────────────┐
│  Windmill (windmill.arealisticdreamer.com)             │
│                                                       │
│  Script: u/admin/thumbnail-screenshot                 │
│    → CamoFox (anti-detect Firefox in Docker)          │
│    → Navigates to /api/render?d=DESIGN_ID             │
│    → page.query_selector('#thumbnail')                │
│    → element.screenshot() → PNG bytes                 │
│    → Returns base64 PNG                               │
└───────────────────────────────────────────────────────┘
           │
           ▼
┌────────────────────────┐
│  Cloudflare R2          │
│                        │
│  /backgrounds/         │
│    /abstract/          │
│    /nature/            │
│    /business/          │
│    /texture/           │
│    /gradient/          │
│    /brand/goha/        │
│    /brand/vibery/      │
│  /brands/              │
│    /goha/kit.json      │
│    /goha/logos/         │
│    /vibery/kit.json    │
│    /vibery/logos/       │
│  /designs/             │
│    /{id}.json          │
│  /exports/             │
│    /{hash}.png         │
└────────────────────────┘
```

### Two Capture Paths

| Path | Engine | Trigger | Use Case |
|------|--------|---------|----------|
| Client-side | snapdom in browser | User clicks "Download" in Builder UI | Manual creation, instant |
| Server-side | CamoFox via Windmill | `POST /api/generate` | API consumers, automation, bulk |

---

## Layouts

Layouts are **pure HTML/CSS files**. All positioning, styling, and responsiveness lives in the HTML — no abstraction layer. The only JSON is a param schema so the UI knows what form fields to render.

### Layout Library

| ID | Name | Category | Description |
|----|------|----------|-------------|
| `split-left` | Split Left | landscape | Image left 50%, text panel right |
| `split-right` | Split Right | landscape | Mirror of split-left |
| `overlay-center` | Overlay Center | landscape, square | Full background + centered text overlay |
| `overlay-bottom` | Overlay Bottom | landscape, square | Full background + bottom text bar |
| `card-center` | Card Center | square, portrait | Centered image with text below |
| `text-only` | Text Only | all | Bold text on solid/gradient background |
| `collage-2` | Two Image Collage | landscape | Two images side by side + text |
| `frame` | Frame Overlay | all | User image fills canvas, branded frame on top |

### Layout HTML Structure

```html
<!-- layouts/split-left.html -->
<script type="application/json" id="layout-meta">
{
  "id": "split-left",
  "name": "Split Left",
  "categories": ["landscape"],
  "params": [
    { "key": "title", "type": "text", "label": "Title", "required": true },
    { "key": "subtitle", "type": "text", "label": "Subtitle" },
    { "key": "feature_image", "type": "image", "label": "Feature Image", "searchable": true },
    { "key": "title_color", "type": "color", "label": "Title Color" },
    { "key": "accent_color", "type": "color", "label": "Accent Color" }
  ]
}
</script>

<div id="thumbnail" style="width: {{width}}px; height: {{height}}px;">
  <div class="left-panel">
    <img src="{{feature_image}}" />
  </div>
  <div class="right-panel" style="background: {{background}};">
    <img class="logo" src="{{logo}}" />
    <h1 style="color: {{title_color}}">{{title}}</h1>
    <p style="color: {{subtitle_color}}">{{subtitle}}</p>
  </div>
</div>

<style>
  #thumbnail {
    display: flex;
    overflow: hidden;
    font-family: var(--font-heading, 'Montserrat', sans-serif);
  }
  .left-panel {
    flex: 1;
    overflow: hidden;
  }
  .left-panel img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 8%;
  }
  h1 {
    font-size: clamp(1.5rem, 4vw, 3rem);
    font-weight: 800;
    line-height: 1.2;
    margin: 0;
  }
  p {
    font-size: clamp(0.9rem, 2vw, 1.4rem);
    margin-top: 0.5em;
    opacity: 0.9;
  }
  .logo {
    width: 80px;
    position: absolute;
    top: 5%;
    right: 5%;
  }
</style>
```

### Size Handling

Layouts use **relative units + CSS clamp()** so the same HTML adapts to different sizes within the same category:

```css
h1 { font-size: clamp(1.5rem, 4vw, 3rem); }    /* scales with width */
.panel { padding: 8%; }                          /* proportional spacing */
.left-panel { flex: 1; }                         /* ratio-based, not fixed px */
```

| Size change | What happens |
|-------------|-------------|
| fb-post → yt-thumbnail (landscape→landscape) | Same HTML, CSS scales — works |
| fb-post → og-image (same dimensions) | Identical — works |
| fb-post → ig-post (landscape→square) | Layout incompatible — UI shows warning, suggests compatible layouts |
| ig-post → ig-story (square→portrait) | Layout incompatible — UI suggests alternatives |

**Rule**: size changes within the same category are handled by CSS. Cross-category changes prompt the user to pick a new layout.
```

---

## Brand Kit

### Data Model

```json
{
  "id": "goha",
  "name": "GOHA",
  "slug": "goha",
  "colors": {
    "primary": "#1a1a3e",
    "secondary": "#FFD700",
    "accent": "#FF6B35",
    "text_light": "#FFFFFF",
    "text_dark": "#1a1a3e"
  },
  "fonts": {
    "heading": "Montserrat",
    "body": "Be Vietnam Pro"
  },
  "logos": [
    { "id": "main", "url": "/brands/goha/logos/goha-white.png", "name": "GOHA White" },
    { "id": "dark", "url": "/brands/goha/logos/goha-dark.png", "name": "GOHA Dark" },
    { "id": "icon", "url": "/brands/goha/logos/goha-icon.png", "name": "GOHA Icon" }
  ],
  "backgrounds": [
    { "url": "/brands/goha/bg/circuit-board.png", "tags": ["tech", "ai"], "name": "Circuit Board" },
    { "url": "/brands/goha/bg/data-flow.png", "tags": ["tech", "data"], "name": "Data Flow" }
  ],
  "watermark": {
    "url": "/brands/goha/watermark.png",
    "default_opacity": "light"
  },
  "default_text_color": "#FFFFFF",
  "default_overlay": "dark"
}
```

### Brand Kit in the UI

When user selects a brand:
- Color picker pre-fills with brand palette
- Logo selector shows brand logos
- Background picker prioritizes brand backgrounds
- Fonts auto-apply
- Watermark available as toggle

---

## Background System

### Sources (priority order in UI)

| Source | Description | UI Element |
|--------|------------|------------|
| **Brand library** | Curated images for this brand | Grid of thumbnails, first tab |
| **Background store** | Global collection, tagged | Filterable grid by tag |
| **Unsplash search** | Search by keyword | Search bar + results grid |
| **Upload** | User uploads their own | Drag & drop zone |
| **Solid color** | Single color from picker | Color picker |
| **Gradient** | CSS gradient presets or custom | Gradient picker with presets |

### R2 Background Store

```
/backgrounds/
  _index.json              ← manifest: [{url, tags, name, category}]
  /abstract/
  /nature/
  /business/
  /texture/
  /gradient/
  /brand/
    /goha/
    /vibery/
```

### Background API

```
GET /api/backgrounds
  ?brand=goha           → brand-specific first, then global
  ?tag=abstract         → filter by tag
  ?random=true&limit=6  → random selection
  ?q=technology         → search by name/tag
```

---

## Design (Saveable User Creation)

### Data Model

```json
{
  "id": "d_abc123",
  "created_at": "2026-02-26T10:00:00Z",
  "updated_at": "2026-02-26T10:05:00Z",

  "size": {
    "preset": "fb-post",
    "width": 1200,
    "height": 630
  },

  "layout": "split-left",
  "brand": "goha",

  "params": {
    "title": "Tối ưu content B2B cho AI",
    "subtitle": "Cuộc cách mạng tìm kiếm đa bước",
    "title_color": "#FFD700",
    "subtitle_color": "#FFFFFF",
    "accent_color": "#1a1a3e",
    "feature_image": "https://images.unsplash.com/photo-xxx",
    "background": "/brands/goha/bg/circuit-board.png",
    "logo": "/brands/goha/logos/goha-white.png",
    "overlay": "medium",
    "watermark": false
  }
}
```

Flat key-value params — matches exactly what gets injected into the layout HTML via `{{key}}` replacement. No abstraction.

### Design URLs

| URL | Purpose |
|-----|---------|
| `snap.vibery.app/d/abc123` | View/edit saved design in builder UI |
| `snap.vibery.app/api/render?d=abc123` | Render as standalone page (for CamoFox) |
| `snap.vibery.app/api/generate?d=abc123` | Generate PNG via CamoFox, return URL |

### Design Sharing

Designs are JSON in R2. Shareable URL = `snap.vibery.app/d/{id}`. Anyone with the link can:
- View the design
- Fork it (create a copy, modify)
- Download the image

No auth for viewing/forking. Creating/saving requires brand access (future: API key per brand).

---

## Interactive Builder UI

### User Flow

```
1. Pick size preset (or custom)
   ├── Shows compatible layouts for that size category
   │
2. Pick layout
   ├── Live preview appears with placeholder content
   │
3. Pick brand (or "no brand")
   ├── Brand kit auto-applies: colors, fonts, logos
   │
4. Customize
   ├── Background: pick source → select/upload/search
   ├── Fill text slots: title, subtitle
   ├── Text color: pick from brand palette or custom
   ├── Logo: pick which logo, pick position
   ├── Overlay: off / light / medium / dark
   ├── Watermark: on/off
   ├── Feature images: upload, search, pick from brand assets
   │
5. Preview (live, real-time as they edit)
   │
6. Export
   ├── Download PNG (snapdom)
   ├── Save design (→ R2, get shareable URL)
   ├── Copy API URL (for automation)
   └── Export multiple sizes (same design, different presets)
```

### Multi-Size Export

User designs for one size, then can batch-export to other compatible sizes:

```
Design in fb-post (1200×630)
  → Also export as:
    ✓ og-image (1200×630) — same
    ✓ tw-post (1200×675) — slight crop
    ✓ yt-thumbnail (1280×720) — reflow
    ✗ ig-story (1080×1920) — incompatible layout
```

Layout adapts within its category. Cross-category requires different layout.

---

## Snapdom Integration (Client-Side Export)

```js
import { snapdom } from '@zumer/snapdom';

async function capture(sizePreset) {
  const el = document.getElementById('thumbnail');
  const blob = await snapdom(el, {
    width: sizePreset.width * 2,
    height: sizePreset.height * 2,
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${design.id || 'thumbnail'}-${sizePreset.id}.png`;
  a.click();
}
```

---

## Windmill Integration (Server-Side Export)

### Script: `u/admin/thumbnail-screenshot`

```python
import base64
from playwright.async_api import async_playwright

async def main(
    url: str,
    width: int = 1200,
    height: int = 630,
    selector: str = "#thumbnail",
    scale: int = 2
):
    async with async_playwright() as p:
        browser = await p.firefox.launch()
        page = await browser.new_page()
        await page.set_viewport_size({
            "width": width * scale,
            "height": height * scale
        })
        await page.goto(url, wait_until="networkidle")
        await page.wait_for_function("document.fonts.ready")
        await page.wait_for_timeout(500)

        el = await page.query_selector(selector)
        if not el:
            raise Exception(f"Element {selector} not found")

        png_bytes = await el.screenshot(type="png")
        await browser.close()

        return base64.b64encode(png_bytes).decode("utf-8")
```

### CF Worker → Windmill

```typescript
async function generateViaWindmill(designId: string, env: Env) {
  const renderUrl = `https://snap.vibery.app/api/render?d=${designId}`;

  const response = await fetch(
    `${env.WINDMILL_BASE}/jobs/run_wait_result/p/u/admin/thumbnail-screenshot`,
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.WINDMILL_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: renderUrl,
        width: design.size.width,
        height: design.size.height,
        selector: "#thumbnail",
        scale: 2,
      }),
    }
  );

  const base64Png = await response.json();
  return Uint8Array.from(atob(base64Png), c => c.charCodeAt(0));
}
```

---

## Auto Image Search

### Unsplash Integration (Primary)

```
GET /api/search/images?q=AI+technology&per_page=9
```

Worker proxies to Unsplash API, returns simplified results:

```json
{
  "results": [
    {
      "id": "abc",
      "url_thumb": "https://images.unsplash.com/photo-xxx?w=400",
      "url_full": "https://images.unsplash.com/photo-xxx?w=1600",
      "author": "John Doe",
      "color": "#1a1a3e"
    }
  ]
}
```

### Auto Image in API Mode

When `auto_image=true` and image slots are empty:
1. Extract keywords from title (remove Vietnamese stop words)
2. Search Unsplash with keywords
3. Pick first landscape result matching slot aspect ratio
4. Inject into design
5. Render

---

## Fonts

| Font | Role | Weights |
|------|------|---------|
| Be Vietnam Pro | Vietnamese body/UI | 400, 500, 600, 700 |
| Montserrat | Headings/impact | 600, 700, 800, 900 |
| JetBrains Mono | Code/tech feel | 400, 700 |

Brands can specify additional fonts in their kit. All served from `/fonts/*.woff2`.

---

## Tech Stack

| Component | Tech |
|-----------|------|
| Runtime | Cloudflare Workers |
| Storage | Cloudflare R2 |
| Bundler | Wrangler + esbuild |
| DOM capture (client) | @zumer/snapdom |
| DOM capture (server) | CamoFox via Windmill |
| Image search | Unsplash API (primary), Pexels (fallback) |
| Knowledge base | TonyKB MCP (read-only reference) |
| UI framework | Vanilla JS |
| Styling | Vanilla CSS |
| Fonts | Self-hosted WOFF2 |

---

## API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/` | GET | Template Builder UI |
| `/d/:id` | GET | View/edit saved design |
| `/api/render` | GET | Render design as standalone page |
| `/api/generate` | POST | Server-side PNG via CamoFox |
| `/api/layouts` | GET | List layouts |
| `/api/sizes` | GET | List size presets |
| `/api/brands` | GET | List brands + kits |
| `/api/brands/:id/assets` | GET | Brand assets |
| `/api/backgrounds` | GET | Query background store |
| `/api/designs` | POST | Save design |
| `/api/designs/:id` | GET/PUT | Get/update design |
| `/api/search/images` | GET | Unsplash/Pexels proxy |
| `/fonts/:file` | GET | Serve fonts |

### `/api/generate` Body

| Param | Type | Required | Description |
|-------|------|----------|-------------|
| `design_id` | string | Yes* | Saved design ID |
| `inline_design` | object | Yes* | Or pass full design JSON inline |
| `auto_image` | boolean | No | Auto-search feature images from title |
| `format` | string | No | `png` (default) or `jpeg` |
| `scale` | number | No | Pixel scale (default: 2) |
| `direct` | boolean | No | Return PNG binary vs R2 URL |
| `size_override` | string | No | Export at different size preset |

*Either `design_id` or `inline_design` required.

---

## Project Structure

```
/
├── src/
│   ├── index.ts
│   ├── routes/
│   │   ├── builder.ts
│   │   ├── render.ts
│   │   ├── generate.ts
│   │   ├── layouts.ts
│   │   ├── sizes.ts
│   │   ├── brands.ts
│   │   ├── backgrounds.ts
│   │   ├── designs.ts
│   │   └── image-search.ts
│   ├── layouts/
│   │   ├── split-left.html
│   │   ├── split-right.html
│   │   ├── overlay-center.html
│   │   ├── overlay-bottom.html
│   │   ├── card-center.html
│   │   ├── text-only.html
│   │   ├── collage-2.html
│   │   └── frame.html
│   ├── shared/
│   │   ├── param-loader.js
│   │   ├── snapdom-capture.js
│   │   └── layout-renderer.js
│   └── lib/
│       ├── windmill.ts
│       ├── r2.ts
│       ├── unsplash.ts
│       └── sizes.ts
├── public/
│   ├── fonts/
│   │   ├── BeVietnamPro-*.woff2
│   │   ├── Montserrat-*.woff2
│   │   └── JetBrainsMono-*.woff2
│   └── assets/ui/
├── windmill/
│   └── thumbnail-screenshot.py
├── wrangler.toml
└── package.json
```

---

## TonyKB MCP

One read-only reference doc:

```markdown
---
type: doc
access: docs
tags: [thumbnail, snapkit, vibery-creative-suite, goha, vibery, api]
---

# SnapKit (snap.vibery.app)

Multi-brand thumbnail builder. Part of Vibery Creative Suite.

**Base**: https://snap.vibery.app

## API
- GET /api/layouts — Layouts
- GET /api/sizes — Size presets (fb-post, ig-post, yt-thumbnail, etc.)
- GET /api/brands — Brands with kits
- POST /api/designs — Save design
- POST /api/generate — Generate PNG via CamoFox

## Generate
POST /api/generate
{"inline_design":{"size":{"preset":"fb-post"},"layout":"split-left","brand":"goha","params":{"title":"..."}}, "auto_image":true}

## Vibery Creative Suite
- snap.vibery.app — SnapKit (visual) ← this
- brand.vibery.app — BrandKit (brand management) — future
- copy.vibery.app — CopyKit (AI copy) — future
- post.vibery.app — PostKit (full post composer) — future
```

---

## Release Scope (Single Release)

### Core
- [ ] CF Worker routing (all endpoints)
- [ ] R2 bucket setup
- [ ] Self-hosted Vietnamese fonts
- [ ] 2x retina output

### Size Presets
- [ ] All platform presets (13 presets + custom)
- [ ] Size category mapping to layouts
- [ ] Multi-size export from single design

### Layouts (8)
- [ ] split-left, split-right, overlay-center, overlay-bottom
- [ ] card-center, text-only, collage-2, frame
- [ ] Responsive scaling within size categories

### Brand Kit System
- [ ] Brand config via kit.json in R2
- [ ] Per-brand: colors, fonts, logos, backgrounds, watermark
- [ ] Brand selector in UI auto-applies kit
- [ ] "No brand" mode

### Background System
- [ ] R2 store with tagged folders + manifest
- [ ] Brand-specific backgrounds
- [ ] Unsplash search
- [ ] Upload, solid color, gradient picker
- [ ] Random from store

### Interactive Builder UI
- [ ] Size preset picker
- [ ] Layout gallery (filtered by category)
- [ ] Brand selector
- [ ] Live real-time preview
- [ ] Background picker (all sources)
- [ ] Text editing + color picker (brand palette + custom)
- [ ] Logo selector + position
- [ ] Overlay darkness control
- [ ] Watermark toggle
- [ ] Feature image search per slot
- [ ] snapdom download
- [ ] Save → shareable URL
- [ ] Fork design
- [ ] Multi-size batch export

### Server-Side Generation
- [ ] POST /api/generate
- [ ] Windmill thumbnail-screenshot script (CamoFox)
- [ ] R2 export caching
- [ ] auto_image keyword extraction + Unsplash
- [ ] Size override for batch

### Design Persistence
- [ ] Save to R2 as JSON
- [ ] Shareable URL /d/:id
- [ ] Fork (copy + modify)

### TonyKB
- [ ] One reference doc

---

## Future: Vibery Creative Suite

SnapKit is the first module of **Vibery Creative Suite** — an AI-powered brand content engine across `*.vibery.app`.

### Suite Map

| Subdomain | Product | Role | Status |
|-----------|---------|------|--------|
| `snap.vibery.app` | **SnapKit** | Visual builder (thumbnails, banners, frames) | **Building now** |
| `brand.vibery.app` | **BrandKit** | Brand management (kits, voice, personas, assets) | Future — brand kits in R2 for now |
| `copy.vibery.app` | **CopyKit** | AI copywriting (headlines, captions, ad copy) | Future |
| `post.vibery.app` | **PostKit** | Full post composer (visual + copy + scheduling) | Future |

### Orchestration Vision

```
Input: "New blog post: Tối ưu content B2B cho AI"

Vibery Creative Suite:
  1. BrandKit → reads GOHA voice, colors, audience
  2. CopyKit  → generates headline variations in brand voice
  3. SnapKit  → searches feature image + creates thumbnail
  4. CopyKit  → writes social caption + hashtags
  5. PostKit  → packages everything → ready to publish

One input → full marketing package per platform
```

### AI Agent Integration

| Agent | How it uses the Suite |
|-------|---------------------|
| Amy (OpenClaw) | "Create social posts for this week's blog content" |
| Windmill flows | Auto-generate thumbnail + caption on new blog publish |
| Claude (this chat) | "Make me a GOHA thumbnail about AI optimization" |

### SnapKit Design Decisions for Suite Compatibility

Built into SnapKit now to avoid refactoring later:

1. **Brand kit interface** — SnapKit reads brands via a clean API contract. Today it's R2 JSON, tomorrow it's BrandKit service. Same interface:
```typescript
// Today
const brand = await r2.get(`brands/goha/kit.json`);
// Future — same shape, different source
const brand = await fetch(`https://brand.vibery.app/api/brands/goha`);
```

2. **Param-based rendering** — designs are flat key-value params. CopyKit can generate `{ title, subtitle }` and pass directly to SnapKit API.

3. **Stateless generate API** — `POST /api/generate` accepts inline design JSON. No UI session needed. Any service or agent can call it.

4. **Brand kit will expand** — current kit has colors, fonts, logos, backgrounds. Future BrandKit adds:

| Today (SnapKit) | Future (BrandKit) |
|---|---|
| Colors, fonts, logos | + Brand voice description |
| Background library | + Audience personas |
| Watermark | + Tone guidelines |
| | + Content pillars |
| | + Platform-specific rules (Vietnamese vs English) |
| | + Competitor context |

This is the Brand Foundation Builder skill productized as a service.

---

## Open Questions

1. **Auth**: Open for builder, API key for `/api/generate`?
2. **Background store seeding**: Target 50-100 images across categories?
3. **CamoFox concurrency**: Max concurrent sessions on Windmill?
4. **Text overflow**: Auto font-size reduction via CSS `clamp()` + JS fallback?
5. **Custom brand fonts**: Allow upload? Adds complexity.
6. **Design expiry**: No expiry recommended — tiny JSON files.
