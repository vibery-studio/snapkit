// Route handler: POST /api/auto-thumbnail
// One-call thumbnail generation for programmatic workflows

import type { Env } from '../lib/types';
import { jsonResponse, errorResponse } from '../lib/response-helpers';
import { extractKeywords, getColorMood } from '../lib/ai-search-query';
import { searchPexels } from '../lib/pexels';
import { d1Get } from '../lib/d1-helpers';
import { saveDesign } from '../lib/design-store';
import { resolveBrandKit } from './brand-crud';
import { getSizeById } from '../data/size-presets';

interface AutoThumbnailRequest {
  template?: string;
  title: string;
  subtitle?: string;
  bg_image?: string;
  feature_image?: string;
  auto_image?: boolean;
}

// Default template when none specified
const DEFAULT_TEMPLATE: Template = {
  id: 'default',
  name: 'Default Template',
  brand: 'goha',
  layout: 'agency-split',
  size: 'agency-wide',
  params: {
    bg_color: '#0f1629',
    title_color: '#FFD700',
    subtitle_color: '#FFFFFF',
  },
};

interface Template {
  id: string;
  name: string;
  brand: string;
  layout: string;
  size: string;
  params: Record<string, string>;
}

interface TemplateRow {
  id: string;
  name: string;
  brand: string | null;
  layout: string;
  size: string;
  params: string;
}

/**
 * POST /api/auto-thumbnail
 *
 * One-call thumbnail generation. Template provides all defaults.
 */
export async function handleAutoThumbnail(request: Request, env: Env): Promise<Response> {
  let body: AutoThumbnailRequest;
  try {
    body = await request.json() as AutoThumbnailRequest;
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const { title, subtitle, template: templateId } = body;

  if (!title?.trim()) {
    return errorResponse('Missing required field: title');
  }

  // Load template from D1 (use default if not specified)
  let tpl: Template | null = null;
  if (templateId && templateId !== 'default') {
    const row = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [templateId]);
    if (!row) {
      return errorResponse(`Template not found: ${templateId}`, 404);
    }
    tpl = {
      id: row.id,
      name: row.name,
      brand: row.brand || 'goha',
      layout: row.layout,
      size: row.size,
      params: JSON.parse(row.params),
    };
  } else {
    tpl = DEFAULT_TEMPLATE;
  }

  // All settings come from template
  const brandId = tpl.brand;
  const layoutId = tpl.layout;
  const sizeId = tpl.size;

  // Load brand for color mood
  const brand = await resolveBrandKit(brandId, env);
  const brandMood = brand ? getColorMood(brand.colors.primary) : undefined;

  // Determine background image
  let bgImage = body.bg_image || tpl.params.bg_image;
  let searchQuery = '';

  const autoImage = body.auto_image !== false;
  const needsBgImage = !bgImage && autoImage;

  if (needsBgImage && env.PEXELS_API_KEY) {
    searchQuery = extractKeywords(title, brandMood);
    try {
      const results = await searchPexels(searchQuery, 1, env);
      if (results.length > 0) {
        bgImage = results[0].url_full;
      }
    } catch {
      // Continue without
    }
  }

  // Determine feature image if layout needs it
  let featureImage = body.feature_image || tpl.params.feature_image;
  const needsFeature = ['split-left', 'split-right', 'card-center', 'frame', 'agency-split'].includes(layoutId);

  if (!featureImage && needsFeature && autoImage && env.PEXELS_API_KEY) {
    const fQuery = extractKeywords(title, brandMood);
    try {
      const results = await searchPexels(fQuery, 1, env);
      if (results.length > 0) {
        featureImage = results[0].url_full;
      }
    } catch {
      // Continue without
    }
  }

  // Build design params
  const designParams: Record<string, string> = {
    ...tpl.params,
    title: title.trim(),
  };
  if (subtitle) designParams.subtitle = subtitle.trim();
  if (bgImage) designParams.bg_image = bgImage;
  if (featureImage) designParams.feature_image = featureImage;

  // Resolve size dimensions from preset
  const sizePreset = getSizeById(sizeId);
  const sizeObj = {
    preset: sizeId,
    width: sizePreset?.w ?? 1280,
    height: sizePreset?.h ?? 720,
  };

  // Save design to D1
  const design = await saveDesign({
    size: sizeObj,
    layout: layoutId,
    brand: brandId,
    params: designParams,
  }, env);

  // Build URLs
  const baseUrl = new URL(request.url).origin;
  const renderUrl = `${baseUrl}/api/render?d=${design.id}`;
  const editUrl = `${baseUrl}/?design=${design.id}`;

  return jsonResponse({
    design_id: design.id,
    render_url: renderUrl,
    edit_url: editUrl,
    template: templateId || 'default',
    brand: brandId,
    layout: layoutId,
    size: sizeId,
    bg_image: bgImage || null,
    feature_image: featureImage || null,
    search_query: searchQuery || null,
  });
}
