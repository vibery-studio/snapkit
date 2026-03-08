# SnapKit Documentation

Multi-brand thumbnail generator on Cloudflare Workers.

## Documentation Index

| Doc | Description |
|-----|-------------|
| [00-architecture-overview](00-architecture-overview.md) | System shape, entities, tech stack |
| [01-core-flow](01-core-flow.md) | Request → Render → Export pipeline |
| [02-layouts-system](02-layouts-system.md) | Built-in + custom layouts |
| [03-brand-templates](03-brand-templates.md) | Brands, templates, presets |
| [04-image-services](04-image-services.md) | Pexels, Unsplash, AI search |
| [05-api-reference](05-api-reference.md) | All HTTP endpoints |
| [06-deployment](06-deployment.md) | Cloudflare, R2, Windmill |

## Quick Links

| Task | Go To |
|------|-------|
| Add new layout | [02-layouts-system](02-layouts-system.md#adding-custom-layout) |
| Add new brand | [03-brand-templates](03-brand-templates.md) |
| API endpoints | [05-api-reference](05-api-reference.md) |
| Deploy changes | [06-deployment](06-deployment.md#deploy-commands) |

## File Map

```
src/
├── index.ts              # Worker entry
├── data/
│   ├── brand-kits.ts     # Brand definitions
│   ├── size-presets.ts   # Size presets
│   └── custom-layouts/   # Custom layouts by brand
├── layouts/              # Built-in layouts
├── lib/                  # Shared utilities
└── routes/               # API handlers
```
