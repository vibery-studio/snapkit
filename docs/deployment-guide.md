# SnapKit Deployment Guide

## Prerequisites

- Node.js 18+ installed
- Cloudflare account with Workers enabled
- Cloudflare R2 bucket created (`snapkit-storage` or custom)
- Unsplash API key (for image search feature)
- Windmill API credentials (optional, for server-side PNG generation)

## Environment Setup

### 1. Install Dependencies

```bash
npm install
```

Installs wrangler (Cloudflare CLI) and other dev dependencies.

### 2. Configure wrangler.toml

Edit `wrangler.toml`:

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
bucket_name = "snapkit-storage"  # Replace with your R2 bucket name
```

- `bucket_name`: Cloudflare R2 bucket for storing designs, backgrounds, export cache
- Ensure bucket exists in your Cloudflare account

### 3. Set Environment Secrets

Required secrets (set via `wrangler secret put`):

#### UNSPLASH_ACCESS_KEY (Required for Image Search)

Get from [Unsplash Developers](https://unsplash.com/developers):

```bash
wrangler secret put UNSPLASH_ACCESS_KEY
# Paste your Unsplash API key when prompted
```

Used by `/api/search` and `/api/backgrounds?source=unsplash` routes to fetch images.

#### WINDMILL_BASE, WINDMILL_TOKEN, WINDMILL_WORKSPACE (Optional for Server-Side Export)

For server-side PNG generation via CamoFox:

```bash
wrangler secret put WINDMILL_BASE
# Example: https://app.windmill.dev

wrangler secret put WINDMILL_TOKEN
# Your Windmill API token

wrangler secret put WINDMILL_WORKSPACE
# Your Windmill workspace name
```

If not set, client-side snapdom export still works.

### Local Secrets (.dev.vars)

For local development, create `.dev.vars`:

```env
UNSPLASH_ACCESS_KEY=your_key_here
WINDMILL_BASE=https://app.windmill.dev
WINDMILL_TOKEN=your_token_here
WINDMILL_WORKSPACE=workspace_name
```

This file is **not** committed to git (in .gitignore).

## Local Development

### Start Dev Server

```bash
npm run dev
```

Starts wrangler dev server on http://localhost:8787

- Hot reload on src/ changes
- Assets served from public/
- Local R2 simulation (miniflare)
- Console output in terminal

### Test Routes

```bash
# Get size presets
curl http://localhost:8787/api/sizes

# Get layouts
curl http://localhost:8787/api/layouts

# Get brands
curl http://localhost:8787/api/brands

# Create design (example)
curl -X POST http://localhost:8787/api/designs \
  -H "Content-Type: application/json" \
  -d '{
    "size_id": "fb-post",
    "layout_id": "overlay-center",
    "brand_id": "goha",
    "title": "Test Design",
    "subtitle": "Testing SnapKit",
    "colors": { "title_color": "#FFF" }
  }'
```

### Testing PNG Export

**Client-Side (snapdom)**:
- Click "Download PNG" in builder
- Browser captures thumbnail via snapdom

**Server-Side (Windmill)**:
- Click "Generate via Server"
- Requires WINDMILL_* secrets set
- Falls back to snapdom if Windmill unavailable

## Production Deployment

### Pre-Deployment Checklist

- [ ] TypeScript compiles without errors: `npm run build`
- [ ] All environment secrets configured via `wrangler secret put`
- [ ] R2 bucket created and binding configured in wrangler.toml
- [ ] Git is clean (no uncommitted changes)

### Deploy to Cloudflare Workers

```bash
npm run deploy
```

This command:
1. Compiles TypeScript to JavaScript
2. Bundles all source files
3. Uploads to Cloudflare Workers
4. Makes live at your deployed URL (e.g., https://snapkit.{your-domain}.workers.dev)

### Verify Deployment

```bash
# Check deployed worker
wrangler deployments list

# Test live routes
curl https://snapkit.{your-domain}.workers.dev/api/sizes
```

## R2 Bucket Setup

### Create Bucket

In Cloudflare Dashboard → R2:
1. Create bucket (e.g., `snapkit-storage`)
2. Copy bucket name to wrangler.toml `bucket_name`

### Bucket Structure

SnapKit uses these prefixes:

```
designs/
  {uuid}.json              # Saved design files
  backgrounds/
    {uuid}.{ext}           # User-uploaded backgrounds

export-cache/
  {hash}.png               # Cached PNG exports (7-day TTL)

brands/                    # Optional: brand assets
  {brand-id}/
    logos/
    backgrounds/
```

### CORS Configuration (If Serving Assets)

If R2 bucket serves files directly to frontend:

```json
[
  {
    "AllowedOrigins": ["https://snapkit.example.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"]
  }
]
```

## Unsplash API Setup

### Get API Key

1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create application
3. Copy "Access Key"
4. Store as `UNSPLASH_ACCESS_KEY` secret

### API Limits

- Free tier: 50 requests/hour
- Paid tier: Higher limits available

Used by:
- `/api/search?q=...` — search images
- `/api/backgrounds?source=unsplash` — background list

### Rate Limiting

Requests include `Authorization: Client-ID {key}` header. Hitting limit returns 403.

## Windmill API Setup (Optional)

For server-side PNG generation with CamoFox:

### Prerequisites

- Windmill account (https://windmill.dev)
- CamoFox enabled (default for paid tiers)
- API token generated

### Configuration

1. Get Windmill workspace URL: `https://app.windmill.dev`
2. Generate API token in account settings
3. Copy workspace name
4. Store as secrets:
   ```bash
   wrangler secret put WINDMILL_BASE      # https://app.windmill.dev
   wrangler secret put WINDMILL_TOKEN     # your_api_token
   wrangler secret put WINDMILL_WORKSPACE # workspace_name
   ```

### Usage

When client calls `POST /api/generate`:
1. generate.ts computes design hash
2. Checks export-cache/{hash}.png in R2
3. If miss: calls Windmill API
4. Windmill renders design → PNG via CamoFox
5. Caches result in R2 export-cache/
6. Returns PNG blob to client

### Fallback

If Windmill unavailable or unconfigured:
- Client-side snapdom export still works
- Builder "Download PNG" button functions normally
- "Generate via Server" button shows error or is disabled

## Monitoring & Logs

### View Deployment Logs

```bash
wrangler tail
```

Streams real-time logs from deployed worker.

### Common Issues

**"R2 bucket not found"**
- Check bucket name in wrangler.toml matches Cloudflare account
- Run `wrangler r2 bucket list` to list buckets

**"UNSPLASH_ACCESS_KEY undefined"**
- Set secret: `wrangler secret put UNSPLASH_ACCESS_KEY`
- Verify in dashboard: Cloudflare → Workers → snapkit → Settings → Secrets

**"Windmill API error"**
- Verify WINDMILL_BASE, WINDMILL_TOKEN, WINDMILL_WORKSPACE are set
- Check Windmill workspace is accessible with token
- Test: `curl -H "Authorization: Bearer {token}" {base}/api/...`

**"snapdom unavailable" (client error)**
- Ensure CDN link in builder.ts loads from unpkg
- Check browser console for CORS issues
- May occur in restricted networks

## Scaling & Performance

### Request Limits

Cloudflare Workers limits:
- **Free tier**: 100,000 requests/day
- **Paid tier**: Unlimited

Monitor usage in Cloudflare Dashboard.

### R2 Storage

- **Design storage**: ~5-10 KB per design
- **Background uploads**: Variable per image
- **Export cache**: ~50-500 KB per cached PNG

Estimate storage based on expected usage. R2 pricing per GB.

### API Rate Limiting

- **Unsplash**: 50 req/hour (free tier) or higher (paid)
- **Windmill**: Based on plan
- **R2**: Unlimited reads/writes per tier

Consider caching responses to reduce external API calls.

### Optimization Tips

1. **Cache Backgrounds**: `/api/backgrounds` response can be cached with `Cache-Control: max-age=3600`
2. **Export Cache**: Deduplicates PNG generation via hash (export-cache.ts)
3. **Brand Data**: Size/layouts/brands are static, highly cacheable
4. **Image Search**: Consider client-side debounce to limit Unsplash requests

## Rollback

### Revert to Previous Deployment

```bash
# List recent deployments
wrangler deployments list

# Rollback to specific version
wrangler rollback --version {version-id}
```

Takes effect immediately across Cloudflare edge.

## Security

### Secrets Management

- Never commit `.env` or `.dev.vars` to git
- Use `wrangler secret` for production secrets
- Rotate API keys periodically (especially WINDMILL_TOKEN)
- Limit R2 bucket permissions to worker binding only

### R2 Bucket Permissions

Create custom R2 API token with limited permissions:
- Read: designs/*, export-cache/*
- Write: designs/*, backgrounds/*, export-cache/*
- No delete (optional, for safety)

### Input Validation

All user input (title, subtitle, colors) validated:
- `escapeHtml()` prevents XSS
- `isValidColor()` validates hex colors
- File uploads scanned for malicious content

### CORS Policy

Builder SPA runs on same origin as worker, no cross-origin issues. If deploying builder separately:
- Configure CORS headers in response-helpers.ts
- Allow specific origins only

## Maintenance

### Update Dependencies

```bash
npm update
```

Check for security patches in wrangler and snapdom.

### Monitor Deployment

Set up alerts in Cloudflare Dashboard:
- Worker errors (5xx responses)
- Unusual traffic spikes
- High latency

### Backup Designs

Periodically export R2 bucket contents:

```bash
# List all designs
wrangler r2 object list snapkit-storage --prefix designs/

# Download for backup
for id in $(wrangler r2 object list snapkit-storage --prefix designs/ --json | jq -r '.[].key'); do
  wrangler r2 object get snapkit-storage "$id" > "backup/$id"
done
```

## Support & Troubleshooting

### Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [R2 Documentation](https://developers.cloudflare.com/r2/)
- [Unsplash API Docs](https://unsplash.com/documentation)
- [Windmill API Docs](https://docs.windmill.dev)

### Get Help

Check logs: `wrangler tail`
Review error messages in browser console
Test individual routes with curl
