// Template engine for custom HTML-based layouts with {{key}} placeholder replacement
import type { Layout, LayoutParam, LayoutRenderParams } from './types';
import { escapeHtml, sanitizeColor } from './html-helpers';

export interface CustomLayoutData {
  id: string;
  name: string;
  categories: Array<'landscape' | 'square' | 'portrait' | 'wide'>;
  params: LayoutParam[];
  html: string;
  css?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Strip script tags from HTML to prevent XSS via custom layouts.
 */
function stripScripts(html: string): string {
  return html.replace(/<script[\s\S]*?<\/script>/gi, '');
}

/**
 * Build values map from LayoutRenderParams for {{key}} replacement.
 */
function buildValuesMap(p: LayoutRenderParams): Record<string, string> {
  // Cast through unknown to safely access optional dynamic fields
  const extra = p as unknown as Record<string, string | undefined>;
  return {
    width: String(p.width),
    height: String(p.height),
    title: escapeHtml(p.title),
    subtitle: escapeHtml(p.subtitle),
    bg_color: sanitizeColor(p.bg_color, '#1a1a3e'),
    bg_image: p.bg_image || '',
    title_color: sanitizeColor(p.title_color, '#FFFFFF'),
    subtitle_color: sanitizeColor(p.subtitle_color, '#FFFFFF'),
    logo: p.logo || '',
    feature_image: p.feature_image || '',
    overlay: p.overlay || 'none',
    logo_position: p.logo_position || 'top-right',
    image_1: extra.image_1 || '',
    image_2: extra.image_2 || '',
    watermark_url: extra.watermark_url || '',
    watermark_opacity: extra.watermark_opacity || 'light',
  };
}

/**
 * Convert a stored custom layout template into a Layout object
 * with a render() function that does {{key}} replacement.
 */
export function createLayoutFromTemplate(data: CustomLayoutData): Layout {
  return {
    id: data.id,
    name: data.name,
    categories: data.categories,
    params: data.params,
    render: (p: LayoutRenderParams) => {
      // Strip scripts before rendering (XSS prevention)
      let html = stripScripts(data.html);

      const values = buildValuesMap(p);

      // Replace all {{key}} placeholders
      html = html.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
        return values[key] ?? '';
      });

      if (data.css) {
        return `<style>${data.css}</style>${html}`;
      }
      return html;
    },
  };
}

/**
 * Validate custom layout data before saving.
 * Returns error string or null if valid.
 */
export function validateCustomLayout(data: Record<string, unknown>): string | null {
  if (!data.name || typeof data.name !== 'string') return 'name is required';
  if (!data.html || typeof data.html !== 'string') return 'html template is required';
  if (!data.categories || !Array.isArray(data.categories) || data.categories.length === 0) {
    return 'categories must be a non-empty array';
  }
  const validCategories = ['landscape', 'square', 'portrait', 'wide'];
  for (const cat of data.categories as string[]) {
    if (!validCategories.includes(cat)) return `invalid category: ${cat}`;
  }
  if (!(data.html as string).includes('id="thumbnail"')) {
    return 'html must contain an element with id="thumbnail"';
  }
  if (data.params !== undefined && !Array.isArray(data.params)) {
    return 'params must be an array';
  }
  return null;
}
