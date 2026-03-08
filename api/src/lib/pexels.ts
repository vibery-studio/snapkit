// Pexels API proxy client
// Proxies to api.pexels.com, maps results to simplified schema

import type { Env } from './types';

export interface PexelsResult {
  id: string;
  url_thumb: string;   // medium size
  url_full: string;    // large2x size
  author: string;
  author_url: string;
  color: string;       // avg_color hex
}

interface PexelsPhoto {
  id: number;
  src: { medium: string; large2x: string };
  photographer: string;
  photographer_url: string;
  avg_color: string;
}

interface PexelsSearchResponse {
  total_results: number;
  page: number;
  per_page: number;
  photos: PexelsPhoto[];
}

/**
 * Search Pexels for photos matching a query.
 * Free tier: 200 requests/hour. Returns simplified result schema.
 */
export async function searchPexels(
  query: string,
  perPage: number,
  env: Env
): Promise<PexelsResult[]> {
  if (!env.PEXELS_API_KEY) {
    throw new Error('PEXELS_API_KEY not configured');
  }

  const clampedPerPage = Math.min(Math.max(1, perPage), 40);
  const apiUrl = new URL('https://api.pexels.com/v1/search');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('per_page', String(clampedPerPage));
  apiUrl.searchParams.set('orientation', 'landscape');

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: env.PEXELS_API_KEY,
    },
  });

  if (res.status === 429) {
    throw new Error('Pexels rate limit exceeded. Try again later.');
  }

  if (!res.ok) {
    throw new Error(`Pexels API error: ${res.status}`);
  }

  const data = await res.json() as PexelsSearchResponse;

  return (data.photos || []).map((photo) => ({
    id: String(photo.id),
    url_thumb: photo.src.medium,
    url_full: photo.src.large2x,
    author: photo.photographer,
    author_url: photo.photographer_url,
    color: photo.avg_color,
  }));
}
