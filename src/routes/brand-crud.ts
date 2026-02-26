// Brand CRUD API route handlers
// POST /api/brands, PUT /api/brands/:id
// POST/DELETE /api/brands/:id/assets/logos|backgrounds|watermark

import type { Env, BrandKit, BrandLogo, BrandBackground } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { r2GetJson, r2PutJson, r2Put, r2Delete } from '../lib/r2-helpers';

const BRAND_PREFIX = 'brands/';
const UPLOAD_MAX_SIZE = 5 * 1024 * 1024; // 5MB

function brandKitKey(id: string): string {
  return `${BRAND_PREFIX}${id}/kit.json`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

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
  const existing = await r2GetJson<BrandKit>(env, brandKitKey(slug));
  if (existing) return errorResponse(`Brand "${slug}" already exists`, 409);

  const colors = (body.colors && typeof body.colors === 'object') ? body.colors as BrandKit['colors'] : null;
  const fonts = (body.fonts && typeof body.fonts === 'object') ? body.fonts as BrandKit['fonts'] : null;

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

  await r2PutJson(env, brandKitKey(slug), kit);
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

  const existing = await r2GetJson<BrandKit>(env, brandKitKey(id));
  if (!existing) return notFoundResponse(`Brand "${id}" not found`);

  const inColors = (body.colors && typeof body.colors === 'object') ? body.colors as Partial<BrandKit['colors']> : null;
  const inFonts = (body.fonts && typeof body.fonts === 'object') ? body.fonts as Partial<BrandKit['fonts']> : null;

  const updated: BrandKit = {
    ...existing,
    name: typeof body.name === 'string' ? body.name : existing.name,
    colors: inColors ? { ...existing.colors, ...inColors } : existing.colors,
    fonts: inFonts ? { ...existing.fonts, ...inFonts } : existing.fonts,
    default_text_color: typeof body.default_text_color === 'string' ? body.default_text_color : existing.default_text_color,
    default_overlay: (body.default_overlay as BrandKit['default_overlay']) ?? existing.default_overlay,
  };

  await r2PutJson(env, brandKitKey(id), updated);
  return jsonResponse(updated);
}

// POST /api/brands/:id/assets/logos — Upload logo file
export async function handleLogoUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await r2GetJson<BrandKit>(env, brandKitKey(id));
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

  // Update kit.json — replace if same id
  const logoEntry: BrandLogo = { id: logoId, url: `/${key}`, name: logoName };
  kit.logos = kit.logos.filter(l => l.id !== logoId);
  kit.logos.push(logoEntry);
  await r2PutJson(env, brandKitKey(id), kit);

  return jsonResponse(kit, 201);
}

// DELETE /api/brands/:id/assets/logos/:logoId — Remove logo
export async function handleLogoDelete(brandId: string, logoId: string, env: Env): Promise<Response> {
  const kit = await r2GetJson<BrandKit>(env, brandKitKey(brandId));
  if (!kit) return notFoundResponse(`Brand "${brandId}" not found`);

  const logo = kit.logos.find(l => l.id === logoId);
  if (!logo) return notFoundResponse(`Logo "${logoId}" not found`);

  // Delete from R2 (strip leading slash)
  const r2Key = logo.url.startsWith('/') ? logo.url.slice(1) : logo.url;
  try {
    await r2Delete(env, r2Key);
  } catch {
    // File may already be gone, proceed
  }

  kit.logos = kit.logos.filter(l => l.id !== logoId);
  await r2PutJson(env, brandKitKey(brandId), kit);
  return jsonResponse(kit);
}

// POST /api/brands/:id/assets/backgrounds — Upload background
export async function handleBgUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await r2GetJson<BrandKit>(env, brandKitKey(id));
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
  await r2PutJson(env, brandKitKey(id), kit);

  return jsonResponse(kit, 201);
}

// DELETE /api/brands/:id/assets/backgrounds/:bgName — Remove background by name slug
export async function handleBgDelete(brandId: string, bgName: string, env: Env): Promise<Response> {
  const kit = await r2GetJson<BrandKit>(env, brandKitKey(brandId));
  if (!kit) return notFoundResponse(`Brand "${brandId}" not found`);

  const bg = kit.backgrounds.find(b => slugify(b.name) === bgName || b.url.includes(`/${bgName}`));
  if (!bg) return notFoundResponse(`Background "${bgName}" not found`);

  const r2Key = bg.url.startsWith('/') ? bg.url.slice(1) : bg.url;
  try {
    await r2Delete(env, r2Key);
  } catch {
    // File may already be gone, proceed
  }

  kit.backgrounds = kit.backgrounds.filter(b => b !== bg);
  await r2PutJson(env, brandKitKey(brandId), kit);
  return jsonResponse(kit);
}

// POST /api/brands/:id/assets/watermark — Upload watermark
export async function handleWatermarkUpload(id: string, request: Request, env: Env): Promise<Response> {
  const kit = await r2GetJson<BrandKit>(env, brandKitKey(id));
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
  await r2PutJson(env, brandKitKey(id), kit);

  return jsonResponse(kit);
}
