// SnapKit - Multi-Brand Thumbnail Generator
// Cloudflare Worker entry point with modular routing

import type { Env } from './lib/types';
import { corsResponse, notFoundResponse, jsonResponse } from './lib/response-helpers';
import { handleBrandsRoute } from './routes/brands';
import { handleBrandCreate, handleBrandUpdate, handleLogoUpload, handleLogoDelete, handleBgUpload, handleBgDelete, handleWatermarkUpload } from './routes/brand-crud';
import { handleBackgrounds, handleBackgroundUpload } from './routes/backgrounds';
import { handleImageSearch } from './routes/image-search';
import { handleAiSearchSuggest } from './routes/ai-search-suggest';
import { handleAutoThumbnail } from './routes/auto-thumbnail';
import { handleDesignCreate, handleDesignGet, handleDesignUpdate, handleDesignFork } from './routes/designs';
import { handleRender } from './routes/render';
import { handleGenerate } from './routes/generate';
import { handleSizes } from './routes/sizes';
import { handleTemplates, handleTemplateById, handleTemplateCreate, handleTemplateUpdate, handleTemplateDelete } from './routes/templates';
import { LAYOUTS } from './layouts';
import { handleLayoutCreate, handleLayoutUpdate, handleLayoutDelete, handleLayoutGet, listCustomLayouts } from './routes/layout-crud';
import { handleAssetUpload } from './routes/asset-upload';
import { handleMediaList, handleMediaGet, handleMediaCreate, handleMediaDelete } from './routes/media';
import { handleScreenshot } from './routes/screenshot';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // CORS preflight
    if (method === 'OPTIONS') {
      return corsResponse();
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

    // POST /api/assets/upload — generic asset upload
    if (path === '/api/assets/upload' && method === 'POST') {
      return handleAssetUpload(request, env);
    }

    // === Media Library ===
    // GET /api/media
    if (path === '/api/media' && method === 'GET') {
      return handleMediaList(url, env);
    }
    // GET /api/media/:id
    if (path.match(/^\/api\/media\/[^/]+$/) && method === 'GET') {
      return handleMediaGet(path.split('/')[3], env);
    }
    // POST /api/media
    if (path === '/api/media' && method === 'POST') {
      return handleMediaCreate(request, env);
    }
    // DELETE /api/media/:id
    if (path.match(/^\/api\/media\/[^/]+$/) && method === 'DELETE') {
      return handleMediaDelete(path.split('/')[3], env);
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

    // GET /api/screenshot — capture template as PNG via TonyAPI
    if (path === '/api/screenshot' && method === 'GET') {
      return handleScreenshot(url, env);
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

    // GET /api/search/images — Pexels+Unsplash proxy with R2 caching
    if (path === '/api/search/images' && method === 'GET') {
      return handleImageSearch(url, env);
    }

    // GET /api/ai/search-suggest — AI-powered search query generation
    if (path === '/api/ai/search-suggest' && method === 'GET') {
      return handleAiSearchSuggest(url, env);
    }

    // POST /api/auto-thumbnail — One-call thumbnail generation
    if (path === '/api/auto-thumbnail' && method === 'POST') {
      return handleAutoThumbnail(request, env);
    }

    // GET /api/templates — list all templates
    if (path === '/api/templates' && method === 'GET') {
      return handleTemplates(env);
    }

    // POST /api/templates — create template
    if (path === '/api/templates' && method === 'POST') {
      return handleTemplateCreate(request, env);
    }

    // GET /api/templates/:id — get single template
    if (path.match(/^\/api\/templates\/[^/]+$/) && method === 'GET') {
      const templateId = path.split('/')[3];
      return handleTemplateById(templateId, env);
    }

    // PUT /api/templates/:id — update template
    if (path.match(/^\/api\/templates\/[^/]+$/) && method === 'PUT') {
      const templateId = path.split('/')[3];
      return handleTemplateUpdate(templateId, request, env);
    }

    // DELETE /api/templates/:id — delete template
    if (path.match(/^\/api\/templates\/[^/]+$/) && method === 'DELETE') {
      const templateId = path.split('/')[3];
      return handleTemplateDelete(templateId, env);
    }

    // 404 for unmatched API routes
    if (path.startsWith('/api/')) {
      return notFoundResponse('API endpoint not found');
    }

    // R2 asset proxy for uploads/, brands/, backgrounds/, r2/
    if (path.startsWith('/uploads/') || path.startsWith('/brands/') || path.startsWith('/backgrounds/') || path.startsWith('/r2/')) {
      const key = path.startsWith('/r2/') ? path.slice(4) : path.slice(1); // Remove /r2/ or leading /
      const obj = await env.R2_BUCKET.get(key);
      if (!obj) return notFoundResponse('Asset not found');
      const headers = new Headers();
      headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
      headers.set('Cache-Control', 'public, max-age=31536000');
      return new Response(obj.body, { headers });
    }

    // SPA fallback: let ASSETS binding handle it (serves index.html for unknown routes)
    return env.ASSETS.fetch(request);
  },
};
