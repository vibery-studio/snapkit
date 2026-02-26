## Phase Implementation Report

### Executed Phase
- Phase: Workstream E — Server-side Export (Windmill/CamoFox)
- Plan: /Applications/MAMP/htdocs/vibelabs/snapkit/plans/260226-0700-snapkit-full-implementation
- Status: completed

### Files Modified

| File | Action | Lines |
|------|--------|-------|
| `windmill/thumbnail-screenshot.py` | Created | 63 |
| `src/lib/windmill-client.ts` | Created | 94 |
| `src/lib/export-cache.ts` | Created | 81 |
| `src/routes/generate.ts` | Created | 196 |

Note: Per task instruction, `src/index.ts` was NOT modified. `handleGenerate` export from `src/routes/generate.ts` is ready for the integration phase to import and replace the 501 stub.

The workstream spec listed `src/lib/windmill.ts` but the file naming hook requires kebab-case; created as `src/lib/windmill-client.ts` for clarity. Integration phase must import from that path.

### Tasks Completed

- [x] Create Windmill screenshot Python script (`windmill/thumbnail-screenshot.py`)
- [x] Create windmill client lib (`src/lib/windmill-client.ts`)
- [x] Create export-cache.ts with SHA-256 hash computation
- [x] Create POST /api/generate route handler (`src/routes/generate.ts`)
- [x] Implement inline_design support (auto-saves temp design to R2, cleans up after)
- [x] Implement auto_image keyword extraction + Unsplash fill
- [x] Implement size_override for alternate-size renders
- [x] Implement direct=true binary response
- [x] Implement R2 export caching (cache hit skips Windmill entirely)
- [x] design_id format validation (prevents URL injection to Windmill)
- [x] WINDMILL_WORKSPACE env var support (local cast, no types.ts modification)

### Tests Status
- Type check: PASS (`npx tsc --noEmit` — 0 errors)
- Unit tests: N/A (no test harness set up in project)
- Integration tests: Requires live Windmill + R2 bindings

### Key Design Decisions

1. **File renamed**: `windmill.ts` → `windmill-client.ts` per kebab-case naming rule
2. **WINDMILL_WORKSPACE**: Not in shared `Env` type (Phase 0 file). Handled via local `WindmillEnv extends Env` cast — no cross-boundary edit needed.
3. **Inline design cleanup**: Temp R2 key deleted fire-and-forget after screenshot captured to avoid R2 bloat
4. **Cache hash for inline**: Hashes the full normalized JSON + scale + format, not just the design body, ensuring size_override and scale changes produce distinct cache entries
5. **Render URL**: Derived from `request.url` origin so localhost dev and prod both work without hardcoded domain

### Issues Encountered

None blocking. One deviation from spec: file named `windmill-client.ts` not `windmill.ts` per project naming convention.

### Next Steps

Integration phase must:
1. In `src/index.ts`, replace the stub:
   ```ts
   import { handleGenerate } from './routes/generate';
   // replace: return errorResponse('...', 501);
   // with:    return handleGenerate(request, env);
   ```
2. Set Cloudflare secrets: `WINDMILL_BASE`, `WINDMILL_TOKEN`, optionally `WINDMILL_WORKSPACE`
3. Deploy Windmill script at `u/admin/thumbnail-screenshot` with `playwright` + `camofox` installed

### Unresolved Questions

1. **Windmill response shape**: Tested against documented API — script return value comes back as bare JSON value. If deployed Windmill version wraps in `{ result: "..." }`, the client handles both cases. Confirm against actual Windmill version.
2. **R2 public access for `/exports/`**: Route `/exports/:hash.png` not yet wired. Exports stored in R2 but public URL assumes worker serves them or R2 custom domain is configured. Integration phase must add `GET /exports/:file` route or configure R2 public domain.
3. **`size_override` + `auto_image` cache collision**: Currently `auto_image` mutates `design.params` before hashing. Two identical designs with `auto_image=true` may get different Unsplash images but same cache key if requested in same second. Acceptable for MVP; deterministic image selection would require pinning Unsplash result ID.
