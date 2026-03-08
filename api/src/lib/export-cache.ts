// R2-backed export cache for generated PNG/JPEG thumbnails
// Cache key = SHA-256 of design fingerprint (first 16 hex chars)
// No TTL — cache invalidated automatically when design updated_at changes

import type { Env } from './types';

const EXPORTS_PREFIX = 'exports/';
const BASE_URL = 'https://snap.vibery.app';

/**
 * Compute a short cache key from design identity fields.
 * Changes to any field produce a different hash → automatic invalidation.
 */
export async function computeExportHash(
  designId: string,
  updatedAt: string,
  scale: number,
  format: string
): Promise<string> {
  const input = `${designId}:${updatedAt}:${scale}:${format}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return fullHex.slice(0, 16);
}

/**
 * Compute cache hash from raw JSON body (for inline_design requests with no ID).
 */
export async function computeInlineExportHash(
  bodyJson: string,
  scale: number,
  format: string
): Promise<string> {
  const input = `inline:${bodyJson}:${scale}:${format}`;
  const encoded = new TextEncoder().encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fullHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return fullHex.slice(0, 16);
}

/**
 * Check R2 for a cached export. Returns R2ObjectBody if hit, null if miss.
 */
export async function getCachedExport(
  hash: string,
  format: string,
  env: Env
): Promise<R2ObjectBody | null> {
  const key = `${EXPORTS_PREFIX}${hash}.${format}`;
  return env.R2_BUCKET.get(key);
}

/**
 * Store PNG/JPEG bytes in R2 and return the public URL.
 */
export async function cacheExport(
  hash: string,
  format: string,
  data: Uint8Array,
  env: Env
): Promise<string> {
  const key = `${EXPORTS_PREFIX}${hash}.${format}`;
  const contentType = format === 'jpeg' ? 'image/jpeg' : 'image/png';

  await env.R2_BUCKET.put(key, data, {
    httpMetadata: { contentType },
  });

  return `${BASE_URL}/${key}`;
}

/**
 * Build the public URL for an already-cached export (no R2 fetch needed).
 */
export function buildExportUrl(hash: string, format: string): string {
  return `${BASE_URL}/${EXPORTS_PREFIX}${hash}.${format}`;
}
