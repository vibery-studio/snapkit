// Route handler for GET /api/render — returns standalone HTML page for screenshot capture
import type { Env } from '../lib/types';
import { errorResponse, notFoundResponse } from '../lib/response-helpers';
import { getDesign } from '../lib/design-store';
import { renderDesignToHTML, renderInlineToHTML } from '../lib/template-renderer';

function htmlResponse(html: string): Response {
  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

// GET /api/render?d=DESIGN_ID
// GET /api/render?layout=overlay-center&size=fb-post&title=Hello&...
export async function handleRender(url: URL, env: Env): Promise<Response> {
  const designId = url.searchParams.get('d');

  // Saved-design path: load from R2 then render
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
    const html = renderInlineToHTML(layoutId, sizeId, params);
    return htmlResponse(html);
  } catch (e) {
    console.error('Render inline error:', e);
    return errorResponse(`Render failed: ${(e as Error).message}`, 400);
  }
}
