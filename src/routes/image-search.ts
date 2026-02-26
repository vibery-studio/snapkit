// Route handler: GET /api/search/images
// Proxies Unsplash photo search with optional R2 result caching (1h TTL)

import type { Env } from '../lib/types';
import { searchUnsplash } from '../lib/unsplash';
import { jsonResponse, errorResponse } from '../lib/response-helpers';
import { r2GetJson, r2PutJson } from '../lib/r2-helpers';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

interface CachedSearch {
  results: Awaited<ReturnType<typeof searchUnsplash>>;
  cached_at: number;
}

function cacheKey(query: string, perPage: number): string {
  return `search-cache/unsplash/${encodeURIComponent(query.toLowerCase())}-${perPage}.json`;
}

/**
 * GET /api/search/images?q=<query>&per_page=<n>
 *
 * Query params:
 *   q        - required, search term
 *   per_page - optional, 1-30 (default 9)
 *
 * Caches results in R2 for 1h to stay within Unsplash free tier (50 req/hr).
 */
export async function handleImageSearch(url: URL, env: Env): Promise<Response> {
  const query = url.searchParams.get('q')?.trim();
  if (!query) {
    return errorResponse('Missing required parameter: q');
  }

  const perPage = Math.min(Math.max(1, parseInt(url.searchParams.get('per_page') || '9', 10)), 30);

  if (!env.UNSPLASH_ACCESS_KEY) {
    return errorResponse('Image search not configured', 501);
  }

  // Check R2 cache first
  try {
    const cached = await r2GetJson<CachedSearch>(env, cacheKey(query, perPage));
    if (cached && Date.now() - cached.cached_at < CACHE_TTL_MS) {
      return jsonResponse({ results: cached.results, cached: true });
    }
  } catch {
    // Cache miss or malformed — proceed to live fetch
  }

  // Live Unsplash fetch
  try {
    const results = await searchUnsplash(query, perPage, env);

    // Store in R2 cache (fire-and-forget — don't block response)
    r2PutJson(env, cacheKey(query, perPage), { results, cached_at: Date.now() } satisfies CachedSearch).catch(
      () => { /* non-critical */ }
    );

    return jsonResponse({ results, cached: false });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Image search failed';
    const status = message.includes('rate limit') ? 429 : 500;
    return errorResponse(message, status);
  }
}
