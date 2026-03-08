// Route handler: GET /api/search/images
// Proxies Unsplash + Pexels photo search with optional R2 result caching (1h TTL)

import type { Env } from '../lib/types';
import { searchUnsplash, type UnsplashResult } from '../lib/unsplash';
import { searchPexels, type PexelsResult } from '../lib/pexels';
import { jsonResponse, errorResponse } from '../lib/response-helpers';
import { r2GetJson, r2PutJson } from '../lib/r2-helpers';

const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

type ImageResult = (UnsplashResult | PexelsResult) & { source: 'unsplash' | 'pexels' };

interface CachedSearch {
  results: ImageResult[];
  cached_at: number;
}

function cacheKey(query: string, perPage: number): string {
  return `search-cache/images/${encodeURIComponent(query.toLowerCase())}-${perPage}.json`;
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

  const hasUnsplash = !!env.UNSPLASH_ACCESS_KEY;
  const hasPexels = !!env.PEXELS_API_KEY;

  if (!hasUnsplash && !hasPexels) {
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

  // Live fetch from available providers
  try {
    const results: ImageResult[] = [];
    const halfPage = Math.ceil(perPage / 2);

    // Try Pexels first (higher rate limit: 200/hr vs 50/hr)
    if (hasPexels) {
      try {
        const pexelsResults = await searchPexels(query, hasUnsplash ? halfPage : perPage, env);
        results.push(...pexelsResults.map(r => ({ ...r, source: 'pexels' as const })));
      } catch {
        // Pexels failed, continue with Unsplash only
      }
    }

    // Try Unsplash
    if (hasUnsplash) {
      try {
        const unsplashResults = await searchUnsplash(query, hasPexels ? halfPage : perPage, env);
        results.push(...unsplashResults.map(r => ({ ...r, source: 'unsplash' as const })));
      } catch {
        // Unsplash failed, continue with Pexels results only
      }
    }

    if (results.length === 0) {
      return errorResponse('No results from image providers', 502);
    }

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
