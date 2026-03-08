// Route handler: GET /api/backgrounds, POST /api/backgrounds/upload
// Serves background images from R2 manifest + brand library
// Upload: accepts multipart image, stores to R2 /uploads/, returns URL

import type { Env } from '../lib/types';
import { r2GetJson, r2Put } from '../lib/r2-helpers';
import { jsonResponse, errorResponse } from '../lib/response-helpers';

const MANIFEST_KEY = 'backgrounds/_index.json';
const UPLOAD_PREFIX = 'uploads/';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

// ─── Types ────────────────────────────────────────────────────────────────────

interface BackgroundEntry {
  url: string;       // R2 key path, e.g. "/backgrounds/abstract/waves.jpg"
  name: string;
  category: string;  // "abstract" | "nature" | "business" | "texture" | "gradient"
  tags: string[];
  brand?: string;    // brand ID if brand-specific
  width?: number;
  height?: number;
}

// ─── Default Stock Backgrounds (Unsplash - free to use) ───────────────────────

const DEFAULT_BACKGROUNDS: BackgroundEntry[] = [
  // Abstract & Tech
  { url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80', name: 'Gradient Blue Purple', category: 'abstract', tags: ['gradient', 'modern'] },
  { url: 'https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1200&q=80', name: 'Neon Lights', category: 'abstract', tags: ['neon', 'tech', 'modern'] },
  { url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80', name: 'Retro Tech', category: 'tech', tags: ['retro', 'gaming'] },
  { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80', name: 'Matrix Code', category: 'tech', tags: ['code', 'digital'] },
  { url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&q=80', name: 'Digital Earth', category: 'tech', tags: ['space', 'data'] },
  { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&q=80', name: 'AI Network', category: 'tech', tags: ['ai', 'network'] },
  // Nature
  { url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80', name: 'Mountain Sunrise', category: 'nature', tags: ['mountain', 'sunrise'] },
  { url: 'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&q=80', name: 'Ocean Waves', category: 'nature', tags: ['ocean', 'water'] },
  { url: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=80', name: 'Green Forest', category: 'nature', tags: ['forest', 'green'] },
  { url: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&q=80', name: 'Beach Sunset', category: 'nature', tags: ['beach', 'sunset'] },
  // Business
  { url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80', name: 'Modern Office', category: 'business', tags: ['office', 'workspace'] },
  { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=1200&q=80', name: 'Team Meeting', category: 'business', tags: ['team', 'meeting'] },
  { url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=80', name: 'Data Analytics', category: 'business', tags: ['data', 'charts'] },
  // Texture
  { url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1200&q=80', name: 'Purple Gradient', category: 'texture', tags: ['gradient', 'purple'] },
  { url: 'https://images.unsplash.com/photo-1557682224-5b8590cd9ec5?w=1200&q=80', name: 'Green Gradient', category: 'texture', tags: ['gradient', 'green'] },
  { url: 'https://images.unsplash.com/photo-1557682260-96773eb01377?w=1200&q=80', name: 'Orange Gradient', category: 'texture', tags: ['gradient', 'orange'] },
  { url: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200&q=80', name: 'Starry Night', category: 'texture', tags: ['stars', 'night'] },
  { url: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=1200&q=80', name: 'Dark Gradient', category: 'texture', tags: ['dark', 'gradient'] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function loadManifest(env: Env): Promise<BackgroundEntry[]> {
  const manifest = await r2GetJson<BackgroundEntry[]>(env, MANIFEST_KEY);
  // Merge R2 manifest with default stock backgrounds
  const r2Entries = manifest ?? [];
  return [...r2Entries, ...DEFAULT_BACKGROUNDS];
}

function filterEntries(
  entries: BackgroundEntry[],
  { brand, tag, q }: { brand?: string | null; tag?: string | null; q?: string | null }
): BackgroundEntry[] {
  let result = entries;

  if (brand) {
    // Brand-specific first, then global (no brand field)
    const brandEntries = result.filter((e) => e.brand === brand);
    const globalEntries = result.filter((e) => !e.brand);
    result = [...brandEntries, ...globalEntries];
  }

  if (tag) {
    result = result.filter(
      (e) => e.category === tag || e.tags.includes(tag)
    );
  }

  if (q) {
    const lower = q.toLowerCase();
    result = result.filter(
      (e) =>
        e.name.toLowerCase().includes(lower) ||
        e.tags.some((t) => t.toLowerCase().includes(lower)) ||
        e.category.toLowerCase().includes(lower)
    );
  }

  return result;
}

function pickRandom<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/** Derive a short SHA-256-based hex string for upload dedup. */
async function hashBytes(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest))
    .slice(0, 4)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// ─── Route: GET /api/backgrounds ─────────────────────────────────────────────

/**
 * GET /api/backgrounds
 * Query params:
 *   brand   - filter brand-specific first, then global
 *   tag     - filter by category or tag string
 *   q       - search by name/tag/category
 *   random  - "true" to randomise result order
 *   limit   - max number of results (default: all)
 */
export async function handleBackgrounds(url: URL, env: Env): Promise<Response> {
  const brand = url.searchParams.get('brand');
  const tag = url.searchParams.get('tag');
  const q = url.searchParams.get('q');
  const random = url.searchParams.get('random') === 'true';
  const limit = parseInt(url.searchParams.get('limit') || '0', 10);

  try {
    let entries = await loadManifest(env);
    entries = filterEntries(entries, { brand, tag, q });

    if (random) {
      entries = pickRandom(entries, limit > 0 ? limit : entries.length);
    } else if (limit > 0) {
      entries = entries.slice(0, limit);
    }

    return jsonResponse({ backgrounds: entries, total: entries.length });
  } catch (err) {
    console.error('Backgrounds fetch error:', err);
    return errorResponse('Failed to load backgrounds', 500);
  }
}

// ─── Route: POST /api/backgrounds/upload ─────────────────────────────────────

/**
 * POST /api/backgrounds/upload
 * Accepts multipart/form-data with field "file" (image/*).
 * Validates: max 5MB, image content type.
 * Stores to R2: uploads/{hash}.{ext}
 * Returns: { url: "/uploads/{hash}.{ext}" }
 */
export async function handleBackgroundUpload(request: Request, env: Env): Promise<Response> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return errorResponse('Invalid multipart form data');
  }

  const file = formData.get('file');
  // Duck-type check: Workers FormData returns File-like objects with .type and .arrayBuffer()
  if (!file || typeof file === 'string' || typeof (file as any).arrayBuffer !== 'function') {
    return errorResponse('Missing file field in form data');
  }

  const fileEntry = file as File;

  // Validate content type
  if (!fileEntry.type.startsWith('image/')) {
    return errorResponse('Only image files are accepted');
  }

  // Validate file size
  const buffer = await fileEntry.arrayBuffer();
  if (buffer.byteLength > MAX_UPLOAD_BYTES) {
    return errorResponse('File exceeds 5MB limit');
  }

  // Derive extension from MIME type or filename
  const ext = fileEntry.name.split('.').pop()?.toLowerCase() || mimeToExt(fileEntry.type);

  // Hash for dedup key
  const hash = await hashBytes(buffer);
  const key = `${UPLOAD_PREFIX}${hash}.${ext}`;

  try {
    await r2Put(env, key, buffer, {
      httpMetadata: { contentType: fileEntry.type },
    });

    return jsonResponse({ url: `/${key}` }, 201);
  } catch (err) {
    console.error('Upload error:', err);
    return errorResponse('Upload failed', 500);
  }
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
  };
  return map[mime] ?? 'jpg';
}

// Re-export BackgroundEntry type for use in index.ts if needed
export type { BackgroundEntry };
