# 01-core-flow

The core pipeline: receive request → resolve layout → render HTML → return/capture PNG. Two paths exist: client-side (snapdom) and server-side (Windmill).

## Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant B as Builder UI
    participant W as Worker
    participant L as Layout Registry
    participant R2 as R2 Storage

    U->>B: Edit title/colors/image
    B->>W: GET /api/render?layout=X&title=Y
    W->>L: resolveLayout(id)
    L-->>W: Layout.render()
    W-->>B: HTML response
    B->>B: Display in iframe
    U->>B: Click Download
    B->>B: snapdom.toPng()
    B-->>U: PNG file
```

## Rendering Paths

| Path | Trigger | Method | Use Case |
|------|---------|--------|----------|
| Client | Builder UI | snapdom in browser | Interactive editing |
| Server | API with `?ssr=1` | Windmill/CamoFox | Batch generation |

## State Flow (Builder)

```mermaid
stateDiagram-v2
    [*] --> Init: Load page
    Init --> Ready: Fetch brands/sizes/layouts
    Ready --> Editing: User changes
    Editing --> Preview: render()
    Preview --> Editing: More changes
    Editing --> Saving: Click Save
    Saving --> Ready: Design saved
    Ready --> Export: Click Download
    Export --> Ready: PNG downloaded
```

## Key Functions

| Function | Location | Purpose |
|----------|----------|---------|
| `resolveLayout(id)` | `layouts/index.ts` | Get layout by ID |
| `renderInlineToHTML()` | `lib/template-renderer.ts` | Layout → HTML page |
| `renderDesignToHTML()` | `lib/template-renderer.ts` | Saved design → HTML |
| `handleRender()` | `routes/render.ts` | `/api/render` endpoint |

## File Reference

| File | Purpose |
|------|---------|
| `src/routes/builder.ts` | Main UI, state management |
| `src/routes/render.ts` | Render endpoint |
| `src/lib/template-renderer.ts` | HTML generation |

## Cross-References

| Doc | Relation |
|-----|----------|
| [00-architecture-overview](00-architecture-overview.md) | System context |
| [02-layouts-system](02-layouts-system.md) | Layout rendering |
| [05-api-reference](05-api-reference.md) | Endpoint details |
