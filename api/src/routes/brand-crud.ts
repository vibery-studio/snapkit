// Brand CRUD API route handlers
// POST /api/brands, PUT /api/brands/:id
// POST/DELETE /api/brands/:id/assets/logos|backgrounds|watermark

import type { Env, BrandKit, BrandLogo, BrandBackground } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { r2Put, r2Delete } from '../lib/r2-helpers';
import { d1Get, d1Run, slugify } from '../lib/d1-helpers';
import { BRANDS } from '../data/brand-kits';

interface BrandRow {
  id: string;
  name: string;
  slug: string;
  colors: string;
  fonts: string;
  logos: string;
  backgrounds: string;
  watermark: string | null;
  default_text_color: string;
  default_overlay: string;
  created_at: string;
  updated_at: string;
}

function rowToBrandKit(row: BrandRow): BrandKit {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    colors: JSON.parse(row.colors),
    fonts: JSON.parse(row.fonts),
    logos: JSON.parse(row.logos),
    backgrounds: JSON.parse(row.backgrounds),
    watermark: row.watermark ? JSON.parse(row.watermark) : undefined,
    default_text_color: row.default_text_color,
    default_overlay: row.default_overlay as BrandKit['default_overlay'],
  };
}

// Resolve brand from D1 first, fallback to hardcoded
export async function resolveBrandKit(id: string, env: Env): Promise<BrandKit | null> {
  const row = await d1Get<BrandRow>(env, 'SELECT * FROM brands WHERE id = ? OR slug = ?', [id, id]);
  if (row) return rowToBrandKit(row);
  return BRANDS[id] ?? null;
}

// List all brands from D1
export async function listBrands(env: Env): Promise<BrandKit[]> {
  const result = await env.DB.prepare('SELECT * FROM brands ORDER BY name').all<BrandRow>();
  return (result.results ?? []).map(rowToBrandKit);
}

const BRAND_PREFIX = 'brands/';
const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB

// POST /api/brands — Create new brand kit
export async function handleBrandCreate(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  if (!body.name || typeof body.name !== 'string') {
    return errorResponse('name is required');
  }

  const slug = typeof body.slug === 'string' ? body.slug : slugify(body.name);

  // Check if brand already exists
  const existing = await d1Get<BrandRow>(env, 'SELECT id FROM brands WHERE slug = ?', [slug]);
  if (existing) return errorResponse(`Brand "${slug}" already exists`, 409);

  const colors = (body.colors && typeof body.colors === 'object') ? body.colors as BrandKit['colors'] : null;
  const fonts = (body.fonts && typeof body.fonts === 'object') ? body.fonts as BrandKit['fonts'] : null;
  const now = new Date().toISOString();

  const kit: BrandKit = {
    id: slug,
    name: body.name,
    slug,
    colors: colors || {
      primary: '#1a1a3e',
      secondary: '#FFD700',
      accent: '#FF6B35',
      text_light: '#FFFFFF',
      text_dark: '#1a1a3e',
    },
    fonts: fonts || { heading: 'Montserrat', body: 'Be Vietnam Pro' },
    logos: [],
    backgrounds: [],
    watermark: undefined,
    default_text_color: typeof body.default_text_color === 'string' ? body.default_text_color : '#FFFFFF',
    default_overlay: (body.default_overlay as BrandKit['default_overlay']) || 'dark',
  };

  await d1Run(
    env,
    `INSERT INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      kit.id, kit.name, kit.slug,
      JSON.stringify(kit.colors), JSON.stringify(kit.fonts),
      JSON.stringify(kit.logos), JSON.stringify(kit.backgrounds),
      kit.watermark ? JSON.stringify(kit.watermark) : null,
      kit.default_text_color, kit.default_overlay,
      now, now,
    ]
  );

  return jsonResponse(kit, 201);
}

// PUT /api/brands/:id — Update brand metadata (name, colors, fonts)
export async function handleBrandUpdate(id: string, request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  const existing = await resolveBrandKit(id, env);
  if (!existing) return notFoundResponse(`Brand "${id}" not found`);

  const inColors = (body.colors && typeof body.colors === 'object') ? body.colors as Partial<BrandKit['colors']> : null;
  const inFonts = (body.fonts && typeof body.fonts === 'object') ? body.fonts as Partial<BrandKit['fonts']> : null;
  const now = new Date().toISOString();

  const updated: BrandKit = {
    ...existing,
    name: typeof body.name === 'string' ? body.name : existing.name,
    colors: inColors ? { ...existing.colors, ...inColors } : existing.colors,
    fonts: inFonts ? { ...existing.fonts, ...inFonts } : existing.fonts,
    logos: Array.isArray(body.logos) ? body.logos as BrandKit['logos'] : existing.logos,
    backgrounds: Array.isArray(body.backgrounds) ? body.backgrounds as BrandKit['backgrounds'] : existing.backgrounds,
    default_text_color: typeof body.default_text_color === 'string' ? body.default_text_color : existing.default_text_color,
    default_overlay: (body.default_overlay as BrandKit['default_overlay']) ?? existing.default_overlay,
  };

  // Upsert: insert if from hardcoded, update if from D1
  const row = await d1Get<BrandRow>(env, 'SELECT id FROM brands WHERE id = ?', [id]);
  if (row) {
    await d1Run(
      env,
      `UPDATE brands SET name = ?, colors = ?, fonts = ?, logos = ?, backgrounds = ?, watermark = ?, default_text_color = ?, default_overlay = ?, updated_at = ?
       WHERE id = ?`,
      [
        updated.name, JSON.stringify(updated.colors), JSON.stringify(updated.fonts),
        JSON.stringify(updated.logos), JSON.stringify(updated.backgrounds),
        updated.watermark ? JSON.stringify(updated.watermark) : null,
        updated.default_text_color, updated.default_overlay, now, id,
      ]
    );
  } else {
    await d1Run(
      env,
      `INSERT INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, updated.name, updated.slug,
        JSON.stringify(updated.colors), JSON.stringify(updated.fonts),
        JSON.stringify(updated.logos), JSON.stringify(updated.backgrounds),
        updated.watermark ? JSON.stringify(updated.watermark) : null,
        updated.default_text_color, updated.default_overlay, now, now,
      ]
    );
  }

  return jsonResponse(updated);
}

// Helper to update brand in D1 after asset changes
async function updateBrandAssets(id: string, kit: BrandKit, env: Env): Promise<void> {
  const now = new Date().toISOString();
  const row = await d1Get<BrandRow>(env, 'SELECT id FROM brands WHERE id = ?', [id]);

  if (row) {
    await d1Run(
      env,
      `UPDATE brands SET logos = ?, backgrounds = ?, watermark = ?, updated_at = ? WHERE id = ?`,
      [JSON.stringify(kit.logos), JSON.stringify(kit.backgrounds), kit.watermark ? JSON.stringify(kit.watermark) : null, now, id]
    );
  } else {
    // Insert brand from hardcoded defaults
    await d1Run(
      env,
      `INSERT INTO brands (id, name, slug, colors, fonts, logos, backgrounds, watermark, default_text_color, default_overlay, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id, kit.name, kit.slug,
        JSON.stringify(kit.colors), JSON.stringify(kit.fonts),
        JSON.stringify(kit.logos), JSON.stringify(kit.backgrounds),
        kit.watermark ? JSON.stringify(kit.watermark) : null,
        kit.default_text_color, kit.default_overlay, now, now,
      ]
    );
  }
}

// POST /api/brands/:id/assets/logos — Upload logo file
export async function handleLogoUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await resolveBrandKit(id, env);
  if (!kit) return notFoundResponse(`Brand "${id}" not found`);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Invalid form data');
  }

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string') return errorResponse('Missing file field');
  if (!file.type.startsWith('image/')) return errorResponse('Only image files accepted');
  if (file.size > UPLOAD_MAX_SIZE) return errorResponse('File exceeds 5MB limit');

  const nameField = formData.get('name');
  const logoName = (nameField && typeof nameField === 'string') ? nameField : file.name.replace(/\.[^.]+$/, '');
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const logoId = slugify(logoName) || `logo-${Date.now()}`;
  const key = `${BRAND_PREFIX}${id}/logos/${logoId}.${ext}`;

  const buffer = await file.arrayBuffer();
  await r2Put(env, key, buffer, { httpMetadata: { contentType: file.type } });

  // Update kit — replace if same id
  const logoEntry: BrandLogo = { id: logoId, url: `/${key}`, name: logoName };
  kit.logos = kit.logos.filter(l => l.id !== logoId);
  kit.logos.push(logoEntry);
  await updateBrandAssets(id, kit, env);

  return jsonResponse(kit, 201);
}

// DELETE /api/brands/:id/assets/logos/:logoId — Remove logo
export async function handleLogoDelete(brandId: string, logoId: string, env: Env): Promise<Response> {
  const kit = await resolveBrandKit(brandId, env);
  if (!kit) return notFoundResponse(`Brand "${brandId}" not found`);

  const logo = kit.logos.find(l => l.id === logoId);
  if (!logo) return notFoundResponse(`Logo "${logoId}" not found`);

  // Delete from R2
  const r2Key = logo.url.startsWith('/') ? logo.url.slice(1) : logo.url;
  try {
    await r2Delete(env, r2Key);
  } catch {
    // File may already be gone
  }

  kit.logos = kit.logos.filter(l => l.id !== logoId);
  await updateBrandAssets(brandId, kit, env);
  return jsonResponse(kit);
}

// POST /api/brands/:id/assets/backgrounds — Upload background
export async function handleBgUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await resolveBrandKit(id, env);
  if (!kit) return notFoundResponse(`Brand "${id}" not found`);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Invalid form data');
  }

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string') return errorResponse('Missing file field');
  if (!file.type.startsWith('image/')) return errorResponse('Only image files accepted');
  if (file.size > UPLOAD_MAX_SIZE) return errorResponse('File exceeds 5MB limit');

  const nameField = formData.get('name');
  const bgName = (nameField && typeof nameField === 'string') ? nameField : file.name.replace(/\.[^.]+$/, '');
  const tagsField = formData.get('tags');
  const tags = (tagsField && typeof tagsField === 'string')
    ? tagsField.split(',').map(t => t.trim()).filter(Boolean)
    : [];
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const bgSlug = slugify(bgName) || `bg-${Date.now()}`;
  const key = `${BRAND_PREFIX}${id}/bg/${bgSlug}.${ext}`;

  const buffer = await file.arrayBuffer();
  await r2Put(env, key, buffer, { httpMetadata: { contentType: file.type } });

  const bgEntry: BrandBackground = { url: `/${key}`, tags, name: bgName };
  kit.backgrounds.push(bgEntry);
  await updateBrandAssets(id, kit, env);

  return jsonResponse(kit, 201);
}

// DELETE /api/brands/:id/assets/backgrounds/:bgName — Remove background by name slug
export async function handleBgDelete(brandId: string, bgName: string, env: Env): Promise<Response> {
  const kit = await resolveBrandKit(brandId, env);
  if (!kit) return notFoundResponse(`Brand "${brandId}" not found`);

  const bg = kit.backgrounds.find(b => slugify(b.name) === bgName || b.url.includes(`/${bgName}`));
  if (!bg) return notFoundResponse(`Background "${bgName}" not found`);

  const r2Key = bg.url.startsWith('/') ? bg.url.slice(1) : bg.url;
  try {
    await r2Delete(env, r2Key);
  } catch {
    // File may already be gone
  }

  kit.backgrounds = kit.backgrounds.filter(b => b !== bg);
  await updateBrandAssets(brandId, kit, env);
  return jsonResponse(kit);
}

// POST /api/brands/:id/assets/watermark — Upload watermark
export async function handleWatermarkUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await resolveBrandKit(id, env);
  if (!kit) return notFoundResponse(`Brand "${id}" not found`);

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Invalid form data');
  }

  const file = formData.get('file') as File | null;
  if (!file || typeof file === 'string') return errorResponse('Missing file field');
  if (!file.type.startsWith('image/')) return errorResponse('Only image files accepted');
  if (file.size > UPLOAD_MAX_SIZE) return errorResponse('File exceeds 5MB limit');

  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const key = `${BRAND_PREFIX}${id}/watermark.${ext}`;
  const buffer = await file.arrayBuffer();
  await r2Put(env, key, buffer, { httpMetadata: { contentType: file.type } });

  const opacityField = formData.get('opacity');
  const opacity = (opacityField && typeof opacityField === 'string') ? opacityField as BrandKit['default_overlay'] : 'light';
  kit.watermark = { url: `/${key}`, default_opacity: opacity };
  await updateBrandAssets(id, kit, env);

  return jsonResponse(kit);
}
