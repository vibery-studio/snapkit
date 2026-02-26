// SnapKit - Multi-Brand Thumbnail Generator
// Cloudflare Worker entry point with modular routing

import type { Env } from './lib/types';
import { corsResponse, notFoundResponse } from './lib/response-helpers';
import { handleBuilder } from './routes/builder';
import { handleBrandsRoute } from './routes/brands';
import { handleBrandCreate, handleBrandUpdate, handleLogoUpload, handleLogoDelete, handleBgUpload, handleBgDelete, handleWatermarkUpload } from './routes/brand-crud';
import { handleBackgrounds, handleBackgroundUpload } from './routes/backgrounds';
import { handleImageSearch } from './routes/image-search';
import { handleDesignCreate, handleDesignGet, handleDesignUpdate, handleDesignFork } from './routes/designs';
import { handleRender } from './routes/render';
import { handleDesignView } from './routes/design-viewer';
import { handleGenerate } from './routes/generate';
import { handleSizes } from './routes/sizes';
import { LAYOUTS } from './layouts';
import { jsonResponse } from './lib/response-helpers';
import { handleLayoutCreate, handleLayoutUpdate, handleLayoutDelete, handleLayoutGet, listCustomLayouts } from './routes/layout-crud';

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

    // GET /api/layouts — returns built-in + custom R2 layouts merged
    if (path === '/api/layouts' && method === 'GET') {
      const category = url.searchParams.get('category');

      const builtIn = Object.values(LAYOUTS).map(l => ({
        id: l.id, name: l.name, categories: l.categories, params: l.params, custom: false,
      }));

      const customLayouts = await listCustomLayouts(env);
      const customMapped = customLayouts.map(l => ({
        id: l.id, name: l.name, categories: l.categories, params: l.params, custom: true,
      }));

      let all = [...builtIn, ...customMapped];
      if (category) {
        all = all.filter(l => l.categories.includes(category as any));
      }
      return jsonResponse(all);
    }

    // POST /api/layouts — create custom layout
    if (path === '/api/layouts' && method === 'POST') {
      return handleLayoutCreate(request, env);
    }

    // GET /api/layouts/:id — get single custom layout data (for client-side renderer)
    if (path.match(/^\/api\/layouts\/[^/]+$/) && method === 'GET') {
      const layoutId = path.split('/')[3];
      // Serve built-in as summary if requested
      if (LAYOUTS[layoutId]) {
        const l = LAYOUTS[layoutId];
        return jsonResponse({ id: l.id, name: l.name, categories: l.categories, params: l.params, custom: false });
      }
      return handleLayoutGet(layoutId, env);
    }

    // PUT /api/layouts/:id — update custom layout
    if (path.match(/^\/api\/layouts\/[^/]+$/) && method === 'PUT') {
      const layoutId = path.split('/')[3];
      return handleLayoutUpdate(layoutId, request, env);
    }

    // DELETE /api/layouts/:id — delete custom layout
    if (path.match(/^\/api\/layouts\/[^/]+$/) && method === 'DELETE') {
      const layoutId = path.split('/')[3];
      return handleLayoutDelete(layoutId, env);
    }

    // /api/brands — dispatcher handles GET /api/brands, /api/brands/:id, /api/brands/:id/assets
    if (path.startsWith('/api/brands') && method === 'GET') {
      const brandsResponse = await handleBrandsRoute(request, env, path);
      if (brandsResponse) return brandsResponse;
    }

    // POST /api/brands — create brand
    if (path === '/api/brands' && method === 'POST') {
      return handleBrandCreate(request, env);
    }

    // PUT /api/brands/:id — update brand metadata
    if (path.match(/^\/api\/brands\/[^/]+$/) && method === 'PUT') {
      return handleBrandUpdate(path.split('/')[3], request, env);
    }

    // POST /api/brands/:id/assets/logos — upload logo
    if (path.match(/^\/api\/brands\/[^/]+\/assets\/logos$/) && method === 'POST') {
      return handleLogoUpload(path.split('/')[3], request, env);
    }

    // DELETE /api/brands/:id/assets/logos/:logoId — delete logo
    if (path.match(/^\/api\/brands\/[^/]+\/assets\/logos\/[^/]+$/) && method === 'DELETE') {
      const parts = path.split('/');
      return handleLogoDelete(parts[3], parts[6], env);
    }

    // POST /api/brands/:id/assets/backgrounds — upload background
    if (path.match(/^\/api\/brands\/[^/]+\/assets\/backgrounds$/) && method === 'POST') {
      return handleBgUpload(path.split('/')[3], request, env);
    }

    // DELETE /api/brands/:id/assets/backgrounds/:bgName — delete background
    if (path.match(/^\/api\/brands\/[^/]+\/assets\/backgrounds\/[^/]+$/) && method === 'DELETE') {
      const parts = path.split('/');
      return handleBgDelete(parts[3], parts[6], env);
    }

    // POST /api/brands/:id/assets/watermark — upload watermark
    if (path.match(/^\/api\/brands\/[^/]+\/assets\/watermark$/) && method === 'POST') {
      return handleWatermarkUpload(path.split('/')[3], request, env);
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
    if (path.startsWith('/api/designs/') && method === 'PUT' && !path.endsWith('/fork')) {
      const designId = path.split('/')[3];
      return handleDesignUpdate(designId, request, env);
    }

    // POST /api/designs/:id/fork — fork design
    if (path.match(/^\/api\/designs\/[^/]+\/fork$/) && method === 'POST') {
      const designId = path.split('/')[3];
      return handleDesignFork(designId, request, env);
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
