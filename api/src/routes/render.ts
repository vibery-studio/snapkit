// Route handler for GET /api/render — returns standalone HTML page for screenshot capture
import type { Env } from '../lib/types';
import { errorResponse, notFoundResponse } from '../lib/response-helpers';
import { getDesign } from '../lib/design-store';
import { d1Get } from '../lib/d1-helpers';
import { renderDesignToHTML, renderInlineToHTML } from '../lib/template-renderer';

interface TemplateRow {
  id: string;
  layout: string;
  size: string;
  brand: string | null;
  params: string;
  auto_feature_image: number;
}

function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// GET /api/render?d=DESIGN_ID
// GET /api/render?t=TEMPLATE_ID&title=Hello&subtitle=World
// GET /api/render?layout=overlay-center&size=fb-post&title=Hello&...
export async function handleRender(url: URL, env: Env): Promise<Response> {
  const designId = url.searchParams.get('d');
  const templateId = url.searchParams.get('t');

  // Saved-design path: load from D1 then render
  if (designId) {
    try {
      const design = await getDesign(designId, env);
      if (!design) return notFoundResponse('Design not found');

      const html = await renderDesignToHTML(design, env);
      return htmlResponse(html);
    } catch (e) {
      console.error('Render design error:', e);
      return errorResponse(`Render failed: ${(e as Error).message}`, 500);
    }
  }

  // Template path: load template from D1, override with query params
  if (templateId) {
    try {
      const row = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [templateId]);
      if (!row) return notFoundResponse(`Template not found: ${templateId}`);

      const template = {
        layout: row.layout,
        size: row.size,
        brand: row.brand || 'goha',
        params: JSON.parse(row.params) as Record<string, string>,
        auto_feature_image: row.auto_feature_image === 1,
      };

      // Merge template params with query overrides (title, subtitle, etc.)
      // Include brand from template so logo/colors can be resolved
      const params: Record<string, string> = { ...template.params, brand: template.brand };
      const titleOverridden = url.searchParams.has('title');
      const featureImageOverridden = url.searchParams.has('feature_image');
      url.searchParams.forEach((value, key) => {
        if (key !== 't') params[key] = value;
      });

      // Auto-search feature_image if enabled and title was overridden (but not feature_image)
      if (template.auto_feature_image && titleOverridden && !featureImageOverridden && params.title && env.PEXELS_API_KEY) {
        const { generateSearchQuery, getColorMood } = await import('../lib/ai-search-query');
        const { searchPexels } = await import('../lib/pexels');
        const brandMood = getColorMood(params.bg_color || '#1a1a3e');
        const query = await generateSearchQuery(params.title, { subtitle: params.subtitle, brandMood }, env as never);
        const results = await searchPexels(query, 1, env).catch(() => []);
        if (results.length > 0) params.feature_image = results[0].url_full;
      }

      const html = await renderInlineToHTML(template.layout, template.size, params, env);
      return htmlResponse(html);
    } catch (e) {
      console.error('Render template error:', e);
      return errorResponse(`Render failed: ${(e as Error).message}`, 500);
    }
  }

  // Inline path: layout + size required, all other params optional
  const layoutId = url.searchParams.get('layout');
  const sizeId = url.searchParams.get('size');

  if (!layoutId) return errorResponse('Missing required param: layout (or d for saved design)');
  if (!sizeId) return errorResponse('Missing required param: size');

  // Collect remaining query params as design params
  const params: Record<string, string> = {};
  url.searchParams.forEach((value, key) => {
    if (key !== 'layout' && key !== 'size') {
      params[key] = value;
    }
  });

  try {
    const html = await renderInlineToHTML(layoutId, sizeId, params, env);
    return htmlResponse(html);
  } catch (e) {
    console.error('Render inline error:', e);
    return errorResponse(`Render failed: ${(e as Error).message}`, 400);
  }
}
