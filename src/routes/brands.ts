// Brand kit API route handlers
// Endpoints: GET /api/brands, GET /api/brands/:id, GET /api/brands/:id/assets
// Strategy: R2 checked first, fallback to hardcoded BRANDS data

import type { Env } from '../lib/types';
import type { BrandKit } from '../lib/types';
import { jsonResponse, notFoundResponse } from '../lib/response-helpers';
import { r2GetJson } from '../lib/r2-helpers';
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

// GET /api/brands — list all brands (metadata only)
export async function handleBrandsList(_req: Request, env: Env): Promise<Response> {
  const brands = BRAND_IDS.map(id => {
    const b = BRANDS[id];
    return {
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo: b.logos[0]?.url ?? null,
      colors: {
        primary: b.colors.primary,
        secondary: b.colors.secondary,
      },
    };
  });
  return jsonResponse({ brands });
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
