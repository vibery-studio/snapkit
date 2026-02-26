// Brand kit API route handlers
// Endpoints: GET /api/brands, GET /api/brands/:id, GET /api/brands/:id/assets
// Strategy: R2 checked first, fallback to hardcoded BRANDS data

import type { Env } from '../lib/types';
import type { BrandKit } from '../lib/types';
import { jsonResponse, notFoundResponse } from '../lib/response-helpers';
import { r2GetJson, r2ListByPrefix } from '../lib/r2-helpers';
import { BRANDS, BRAND_IDS } from '../data/brand-kits';

// Try R2 first, fall back to hardcoded brand data
async function resolveBrand(id: string, env: Env): Promise<BrandKit | null> {
  try {
    const r2Kit = await r2GetJson<BrandKit>(env, `brands/${id}/kit.json`);
    if (r2Kit) return r2Kit;
  } catch {
    // R2 unavailable — use hardcoded fallback
  }
  return BRANDS[id] ?? null;
}

// GET /api/brands — list all brands (hardcoded + R2-stored), R2 overrides hardcoded by same ID
export async function handleBrandsList(_req: Request, env: Env): Promise<Response> {
  // Seed with hardcoded brands
  const brandMap: Record<string, { id: string; name: string; slug: string; logo: string | null; colors: { primary: string; secondary: string } }> = {};
  for (const id of BRAND_IDS) {
    const b = BRANDS[id];
    brandMap[id] = {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logos[0]?.url ?? null,
      colors: { primary: b.colors.primary, secondary: b.colors.secondary },
    };
  }

  // Merge R2-stored brands (overrides hardcoded if same ID, adds new ones)
  try {
    const objects = await r2ListByPrefix(env, 'brands/', 200);
    for (const obj of objects) {
      const match = obj.key.match(/^brands\/([^/]+)\/kit\.json$/);
      if (!match) continue;
      const kitId = match[1];
      const kit = await r2GetJson<BrandKit>(env, obj.key);
      if (!kit) continue;
      brandMap[kitId] = {
        id: kit.id,
        name: kit.name,
        slug: kit.slug,
        logo: kit.logos[0]?.url ?? null,
        colors: { primary: kit.colors.primary, secondary: kit.colors.secondary },
      };
    }
  } catch {
    // R2 scan failed — use hardcoded only
  }

  return jsonResponse({ brands: Object.values(brandMap) });
}

// GET /api/brands/:id — full brand kit
export async function handleBrandGet(req: Request, env: Env, id: string): Promise<Response> {
  if (!id) return notFoundResponse('Brand ID required');

  const brand = await resolveBrand(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);

  return jsonResponse(brand);
}

// GET /api/brands/:id/assets — logos + backgrounds + watermark
export async function handleBrandAssets(req: Request, env: Env, id: string): Promise<Response> {
  if (!id) return notFoundResponse('Brand ID required');

  const brand = await resolveBrand(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);

  return jsonResponse({
    logos: brand.logos,
    backgrounds: brand.backgrounds,
    watermark: brand.watermark ?? null,
  });
}

// Route dispatcher — called from main router with URL pattern matching
// Returns null if route doesn't match (caller handles fallthrough)
export async function handleBrandsRoute(
  req: Request,
  env: Env,
  pathname: string
): Promise<Response | null> {
  // GET /api/brands
  if (pathname === '/api/brands') {
    return handleBrandsList(req, env);
  }

  // GET /api/brands/:id/assets
  const assetsMatch = pathname.match(/^\/api\/brands\/([^/]+)\/assets$/);
  if (assetsMatch) {
    return handleBrandAssets(req, env, assetsMatch[1]);
  }

  // GET /api/brands/:id
  const brandMatch = pathname.match(/^\/api\/brands\/([^/]+)$/);
  if (brandMatch) {
    return handleBrandGet(req, env, brandMatch[1]);
  }

  return null; // no match
}
