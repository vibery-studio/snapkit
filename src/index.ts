// SnapKit - Multi-Brand Thumbnail Generator
// Cloudflare Worker entry point with modular routing

import type { Env } from './lib/types';
import { corsResponse, notFoundResponse } from './lib/response-helpers';
import { handleBuilder } from './routes/builder';
import { handleBrandsRoute } from './routes/brands';
import { handleBackgrounds, handleBackgroundUpload } from './routes/backgrounds';
import { handleImageSearch } from './routes/image-search';
import { handleDesignCreate, handleDesignGet, handleDesignUpdate } from './routes/designs';
import { handleRender } from './routes/render';
import { handleDesignView } from './routes/design-viewer';
import { handleGenerate } from './routes/generate';
import { handleSizes } from './routes/sizes';
import { LAYOUTS } from './layouts';
import { jsonResponse } from './lib/response-helpers';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return corsResponse();
    }

    // === UI Routes ===

    // GET / — builder UI
    if (path === '/' || path === '') {
      return handleBuilder();
    }

    // GET /d/:id — view saved design
    if (path.startsWith('/d/')) {
      const designId = path.slice(3);
      return handleDesignView(designId, env);
    }

    // === API Routes ===

    // GET /api/sizes
    if (path === '/api/sizes' && method === 'GET') {
      return handleSizes();
    }

    // GET /api/layouts
    if (path === '/api/layouts' && method === 'GET') {
      const category = url.searchParams.get('category');
      const layouts = Object.values(LAYOUTS).map(l => ({
        id: l.id,
        name: l.name,
        categories: l.categories,
        params: l.params,
      }));
      if (category) {
        return jsonResponse(layouts.filter(l => l.categories.includes(category as any)));
      }
      return jsonResponse(layouts);
    }

    // /api/brands — dispatcher handles GET /api/brands, /api/brands/:id, /api/brands/:id/assets
    if (path.startsWith('/api/brands') && method === 'GET') {
      const brandsResponse = await handleBrandsRoute(request, env, path);
      if (brandsResponse) return brandsResponse;
    }

    // POST /api/designs — create design
    if (path === '/api/designs' && method === 'POST') {
      return handleDesignCreate(request, env);
    }

    // GET /api/designs/:id
    if (path.startsWith('/api/designs/') && method === 'GET') {
      const designId = path.split('/')[3];
      return handleDesignGet(designId, env);
    }

    // PUT /api/designs/:id — update design
    if (path.startsWith('/api/designs/') && method === 'PUT') {
      const designId = path.split('/')[3];
      return handleDesignUpdate(designId, request, env);
    }

    // GET /api/render — render design HTML for screenshot capture
    if (path === '/api/render' && method === 'GET') {
      return handleRender(url, env);
    }

    // POST /api/generate — server-side PNG generation
    if (path === '/api/generate' && method === 'POST') {
      return handleGenerate(request, env);
    }

    // GET /api/backgrounds
    if (path === '/api/backgrounds' && method === 'GET') {
      return handleBackgrounds(url, env);
    }

    // POST /api/backgrounds/upload
    if (path === '/api/backgrounds/upload' && method === 'POST') {
      return handleBackgroundUpload(request, env);
    }

    // GET /api/search/images — Unsplash proxy with R2 caching
    if (path === '/api/search/images' && method === 'GET') {
      return handleImageSearch(url, env);
    }

    // 404 for unmatched API routes
    if (path.startsWith('/api/')) {
      return notFoundResponse('API endpoint not found');
    }

    // Let wrangler handle static assets (fonts, logos, etc.)
    return notFoundResponse();
  },
};
