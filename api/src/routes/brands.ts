// Brand kit API route handlers
// Endpoints: GET /api/brands, GET /api/brands/:id, GET /api/brands/:id/assets
// Strategy: D1 checked first, fallback to hardcoded BRANDS data

import type { Env } from '../lib/types';
import { jsonResponse, notFoundResponse } from '../lib/response-helpers';
import { BRANDS, BRAND_IDS } from '../data/brand-kits';
import { resolveBrandKit, listBrands } from './brand-crud';

// GET /api/brands — list all brands (hardcoded + D1-stored)
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

  // Merge D1-stored brands (overrides hardcoded if same ID, adds new ones)
  try {
    const d1Brands = await listBrands(env);
    for (const kit of d1Brands) {
      brandMap[kit.id] = {
        id: kit.id,
        name: kit.name,
        slug: kit.slug,
        logo: kit.logos[0]?.url ?? null,
        colors: { primary: kit.colors.primary, secondary: kit.colors.secondary },
      };
    }
  } catch {
    // D1 query failed — use hardcoded only
  }

  return jsonResponse({ brands: Object.values(brandMap) });
}

// GET /api/brands/:id — full brand kit
export async function handleBrandGet(_req: Request, env: Env, id: string): Promise<Response> {
  if (!id) return notFoundResponse('Brand ID required');

  const brand = await resolveBrandKit(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);

  return jsonResponse(brand);
}

// GET /api/brands/:id/assets — logos + backgrounds + watermark
export async function handleBrandAssets(_req: Request, env: Env, id: string): Promise<Response> {
  if (!id) return notFoundResponse('Brand ID required');

  const brand = await resolveBrandKit(id, env);
  if (!brand) return notFoundResponse(`Brand "${id}" not found`);

  return jsonResponse({
    logos: brand.logos,
    backgrounds: brand.backgrounds,
    watermark: brand.watermark ?? null,
  });
}

// Route dispatcher — called from main router
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

  return null;
}
