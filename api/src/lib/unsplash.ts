// Unsplash API proxy client
// Proxies to api.unsplash.com, maps results to simplified schema

import type { Env } from './types';

export interface UnsplashResult {
  id: string;
  url_thumb: string;   // ?w=400 small size
  url_full: string;    // regular size ~1080px
  author: string;
  author_url: string;
  color: string;       // dominant color hex (from Unsplash)
}

interface UnsplashPhoto {
  id: string;
  urls: { small: string; regular: string };
  user: { name: string; links: { html: string } };
  color: string;
}

interface UnsplashSearchResponse {
  total: number;
  total_pages: number;
  results: UnsplashPhoto[];
}

/**
 * Search Unsplash for photos matching a query.
 * Free tier: 50 requests/hour. Returns simplified result schema.
 */
export async function searchUnsplash(
  query: string,
  perPage: number,
  env: Env
): Promise<UnsplashResult[]> {
  if (!env.UNSPLASH_ACCESS_KEY) {
    throw new Error('UNSPLASH_ACCESS_KEY not configured');
  }

  const clampedPerPage = Math.min(Math.max(1, perPage), 30);
  const apiUrl = new URL('https://api.unsplash.com/search/photos');
  apiUrl.searchParams.set('query', query);
  apiUrl.searchParams.set('per_page', String(clampedPerPage));
  apiUrl.searchParams.set('orientation', 'landscape');

  const res = await fetch(apiUrl.toString(), {
    headers: {
      Authorization: `Client-ID ${env.UNSPLASH_ACCESS_KEY}`,
      'Accept-Version': 'v1',
    },
  });

  if (res.status === 429) {
    throw new Error('Unsplash rate limit exceeded. Try again later.');
  }

  if (!res.ok) {
    throw new Error(`Unsplash API error: ${res.status}`);
  }

  const data = await res.json() as UnsplashSearchResponse;

  return (data.results || []).map((photo) => ({
    id: photo.id,
    url_thumb: photo.urls.small,
    url_full: photo.urls.regular,
    author: photo.user.name,
    author_url: photo.user.links.html,
    color: photo.color,
  }));
}
