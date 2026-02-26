# SnapKit - Product Development Requirements

## Product Overview

**SnapKit** is a multi-brand thumbnail generator accessible at snap.vibery.app. Enables rapid creation of social media thumbnails with brand-compliant design, real-time preview, and PNG export.

## MVP Scope

### Deliverables
- Single-page web application (Cloudflare Worker)
- 3 size presets: Facebook Post (1200×630), Instagram Post (1080×1080), YouTube Thumbnail (1280×720)
- 1 brand kit: GOHA with custom colors, fonts, and logo
- 1 layout template: Overlay Center (text-focused with optional logo)
- Client-side PNG capture with 2x retina rendering

### Features
- Real-time preview with responsive scaling
- Editable title/subtitle text with max length
- Color customization (background, title, subtitle)
- Logo toggle
- One-click PNG download via snapdom library
- Vietnamese UI and placeholder text

## Tech Stack

### Runtime & Infrastructure
- **Cloudflare Workers**: Edge-compute hosting
- **Wrangler**: CLI for worker development and deployment
- **Static Assets**: Served via wrangler [assets] config from public/ directory

### Client-Side Libraries
- **snapdom** (v2.0.2): DOM-to-PNG capture library
- **Vanilla JavaScript/CSS**: No framework dependencies
- **WOFF2 Fonts**: Montserrat (heading), Be Vietnam Pro (body)

### Build & Development
- Node.js + npm for dependency management
- Development server via wrangler dev on port 8787
- Production deployment via wrangler deploy

## Architecture

### Worker Endpoint
- **GET /**: Serves embedded HTML/CSS/JS bundle
- **GET /fonts/***: Font assets via static config
- **GET /brands/***: Brand logos via static config
- **404**: All unmatched routes

### Embedded HTML
- Single HTML file with inline CSS and ES6 module script
- Client-side state management (size, colors, text)
- No external HTML/CSS/JS files (all bundled)
- crossorigin="anonymous" on logo img for CORS handling

## Data Structures

### SIZE_PRESETS
Array of objects with id, name, width, height, category (landscape/square).

### BRAND (GOHA)
- Colors: primary (#1a1a3e), secondary (#FFD700), accent (#FF6B35), text_light, text_dark
- Fonts: Montserrat (heading), Be Vietnam Pro (body)
- Logo: /brands/goha/logos/goha-white.svg

### LAYOUT (overlay-center)
Renders title + subtitle centered on background with optional logo in top-right.

## Functional Requirements

### Builder UI
- Size selector dropdown (3 presets)
- Title input (max 100 chars, Vietnamese placeholder)
- Subtitle input (max 150 chars, Vietnamese placeholder)
- Color pickers (3: background, title, subtitle)
- Logo toggle checkbox
- Download PNG button (disabled until snapdom loads)

### Preview
- Real-time render on state change (debounced 100ms for text)
- Responsive scaling to fit viewport
- Display dimensions (WxH) below preview
- Shadow effect and border-radius

### Export
- Capture at 2x scale for retina quality
- Filename: snapkit-{size-id}-{timestamp}.png
- Reset preview scaling before capture
- Show "Capturing..." then "Downloaded!" feedback
- Error handling with retry message

## Non-Functional Requirements

### Performance
- Initial load: HTML/CSS/JS inline (no extra requests)
- Font loading: awaited before render via document.fonts.ready
- snapdom error handling: graceful disable if library unavailable

### Accessibility
- Semantic HTML structure
- Focus states on inputs
- Alt text on logo image
- Dark theme for eye comfort

### Browser Support
- Modern browsers with ES6, Fetch API, Blob, Canvas support
- WOFF2 font support required

## Success Criteria

- Thumbnail renders correctly across all 3 size presets
- PNG downloads successfully with correct dimensions at 2x scale
- All UI controls responsive and debounced appropriately
- Colors and text update preview in real-time
- Logo displays or hides correctly
- Mobile responsive layout (controls stack on tablet/mobile)

## Future Roadmap

### Phase 2
- Multi-brand support (add Vibery, other brands)
- Additional layout templates (side-by-side, carousel)
- Background image/pattern support
- Font size/weight customization per brand

### Phase 3
- Server-side rendering via CamoFox
- R2 storage for generated assets
- Template presets (save/load custom configs)
- Batch export (multiple thumbnails at once)

### Phase 4
- API endpoint for programmatic generation
- Analytics tracking (download counts, popular sizes)
- Watermark support

## Constraints

- MVP limited to 1 brand (hardcoded GOHA)
- Single layout template (no dynamic selection)
- Client-side rendering only (no server-side fallback)
- No database or backend API beyond Worker entry point
- Static assets only (no user uploads)

## Dependencies

- @zumer/snapdom ^2.0.2
- wrangler ^4.68.1 (dev)
- Browser APIs: Fetch, Canvas, Blob, Uint8Array

## Glossary

- **Thumbnail**: Generated image for social media posts
- **Size Preset**: Predefined dimensions (W×H)
- **Brand Kit**: Collection of colors, fonts, logos for consistent design
- **Layout Template**: HTML/CSS structure for rendering thumbnails
- **snapdom**: Library for capturing DOM elements as PNG blobs
