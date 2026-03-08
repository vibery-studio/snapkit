// AI-powered search query generation using Cloudflare Workers AI
// Extracts optimal image search terms from title/context

import type { Env } from './types';

interface AiEnv extends Env {
  AI?: {
    run: (model: string, input: unknown) => Promise<{ response: string }>;
  };
}

/**
 * Generate optimal image search query from content context.
 * Uses Cloudflare Workers AI (free tier: 10k neurons/day).
 * Falls back to simple keyword extraction if AI unavailable.
 */
export async function generateSearchQuery(
  title: string,
  context?: { subtitle?: string; brandMood?: string },
  env?: AiEnv
): Promise<string> {
  // Try AI-powered extraction first
  if (env?.AI) {
    try {
      const prompt = `Extract 2-4 image search keywords for a thumbnail background.
Title: "${title}"
${context?.subtitle ? `Subtitle: "${context.subtitle}"` : ''}
${context?.brandMood ? `Brand mood: ${context.brandMood}` : ''}

Return ONLY the search keywords, space-separated. Example: "coffee morning warm cozy"`;

      const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
        prompt,
        max_tokens: 30,
      });

      const query = result.response?.trim();
      if (query && query.length > 2 && query.length < 100) {
        return query;
      }
    } catch {
      // AI failed, fall back to simple extraction
    }
  }

  // Fallback: simple keyword extraction
  return extractKeywords(title, context?.brandMood);
}

/**
 * Simple keyword extraction without AI.
 * Removes stopwords, extracts main topic words.
 */
export function extractKeywords(title: string, mood?: string): string {
  const stopwords = new Set([
    'how', 'to', 'the', 'a', 'an', 'is', 'are', 'for', 'and', 'or', 'of',
    'in', 'on', 'at', 'by', 'with', 'from', 'up', 'about', 'into', 'over',
    'after', 'beneath', 'under', 'above', 'what', 'why', 'when', 'where',
    'which', 'who', 'this', 'that', 'these', 'those', 'my', 'your', 'our',
    'their', 'its', 'i', 'you', 'we', 'they', 'he', 'she', 'it', 'be',
    'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'can', 'need',
  ]);

  const words = title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopwords.has(w));

  // Take top 3 keywords + optional mood
  const keywords = [...new Set(words)].slice(0, 3);
  if (mood) keywords.push(mood);

  return keywords.join(' ') || 'background abstract';
}

/**
 * Derive brand mood from primary color.
 */
export function getColorMood(hexColor: string): string {
  if (!hexColor || hexColor.length < 7) return 'modern';

  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);

  // Warm colors (red/orange/yellow dominant)
  if (r > b + 40 && r > g - 20) return 'warm';
  // Cool colors (blue dominant)
  if (b > r + 40) return 'cool';
  // Green dominant
  if (g > r + 20 && g > b + 20) return 'natural';
  // Dark colors
  if (r < 60 && g < 60 && b < 60) return 'dark elegant';
  // Light colors
  if (r > 200 && g > 200 && b > 200) return 'bright minimal';

  return 'modern';
}
