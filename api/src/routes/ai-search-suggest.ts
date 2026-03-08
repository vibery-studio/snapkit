// Route handler: GET /api/ai/search-suggest
// Generates optimal image search query from title/context using AI

import type { Env } from '../lib/types';
import { generateSearchQuery, getColorMood } from '../lib/ai-search-query';
import { jsonResponse, errorResponse } from '../lib/response-helpers';

/**
 * GET /api/ai/search-suggest?title=<title>&subtitle=<subtitle>&color=<hex>
 *
 * Returns AI-generated search keywords for finding matching images.
 */
export async function handleAiSearchSuggest(url: URL, env: Env): Promise<Response> {
  const title = url.searchParams.get('title')?.trim();
  if (!title) {
    return errorResponse('Missing required parameter: title');
  }

  const subtitle = url.searchParams.get('subtitle')?.trim();
  const color = url.searchParams.get('color')?.trim();
  const brandMood = color ? getColorMood(color) : undefined;

  try {
    const query = await generateSearchQuery(title, { subtitle, brandMood }, env as never);
    return jsonResponse({ query, mood: brandMood });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate search query';
    return errorResponse(message, 500);
  }
}
