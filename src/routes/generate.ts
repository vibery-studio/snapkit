// POST /api/generate — Server-side PNG/JPEG generation via Windmill + CamoFox
// Accepts saved design_id or inline_design JSON, returns R2 URL or binary

import type { Env } from '../lib/types';
import type { Design } from '../lib/types';
import { jsonResponse, errorResponse } from '../lib/response-helpers';
import { r2GetJson, r2PutJson, generateId } from '../lib/r2-helpers';
import { getSizeById } from '../data/size-presets';
import { runWindmillScreenshot } from '../lib/windmill-client';
import {
  computeExportHash,
  computeInlineExportHash,
  getCachedExport,
  cacheExport,
  buildExportUrl,
} from '../lib/export-cache';
import { searchUnsplash } from '../lib/unsplash';

// Vietnamese stop words for auto_image keyword extraction
const VI_STOP_WORDS = new Set([
  'cho', 'cua', 'va', 'la', 'trong', 'den', 'voi',
  'mot', 'nhung', 'cac', 'se', 'da', 'dang', 'duoc',
]);

// Design ID validation — only accept d_[alphanumeric] format
const DESIGN_ID_RE = /^d_[a-zA-Z0-9]+$/;

// Allowed formats
const ALLOWED_FORMATS = new Set(['png', 'jpeg']);

interface GenerateRequestBody {
  design_id?: string;
  inline_design?: Partial<Design>;
  auto_image?: boolean;
  format?: string;
  scale?: number;
  direct?: boolean;
  size_override?: string | null;
}

interface GenerateResult {
  url: string;
  width: number;
  height: number;
  format: string;
  cached: boolean;
}

export async function handleGenerate(request: Request, env: Env): Promise<Response> {
  // Parse request body
  let body: GenerateRequestBody;
  try {
    body = await request.json() as GenerateRequestBody;
  } catch {
    return errorResponse('Invalid JSON body');
  }

  // Validate: must have design_id OR inline_design
  if (!body.design_id && !body.inline_design) {
    return errorResponse('Either design_id or inline_design is required');
  }

  // Validate design_id format to prevent URL injection
  if (body.design_id && !DESIGN_ID_RE.test(body.design_id)) {
    return errorResponse('Invalid design_id format');
  }

  // Normalise params with defaults
  const format = ALLOWED_FORMATS.has(body.format ?? '') ? body.format! : 'png';
  const scale = Math.min(Math.max(1, Math.round(body.scale ?? 2)), 4);
  const direct = body.direct === true;
  const autoImage = body.auto_image === true;

  try {
    // === 1. Resolve design ===
    let design: Design;
    let tempDesignId: string | null = null; // only set when inline_design was saved

    if (body.design_id) {
      const loaded = await r2GetJson<Design>(env, `designs/${body.design_id}.json`);
      if (!loaded) return errorResponse('Design not found', 404);
      design = loaded;
    } else {
      // inline_design: save temporarily to R2 so the render URL works
      const inlineData = body.inline_design!;
      tempDesignId = generateId('d_tmp_');
      const now = new Date().toISOString();

      design = {
        id: tempDesignId,
        created_at: now,
        updated_at: now,
        size: inlineData.size ?? { preset: 'fb-post', width: 1200, height: 630 },
        layout: inlineData.layout ?? 'overlay-center',
        brand: inlineData.brand ?? 'goha',
        params: inlineData.params ?? {},
      };

      await r2PutJson(env, `designs/${tempDesignId}.json`, design);
    }

    // === 2. Apply size_override if requested ===
    let renderWidth = design.size.width;
    let renderHeight = design.size.height;

    if (body.size_override) {
      const overrideSize = getSizeById(body.size_override);
      if (!overrideSize) {
        return errorResponse(`Unknown size_override: ${body.size_override}`);
      }
      renderWidth = overrideSize.w;
      renderHeight = overrideSize.h;
    }

    // === 3. Auto-image: fill empty image slots from Unsplash ===
    if (autoImage) {
      design = await fillAutoImages(design, env);
      // Persist updated params so the render URL reflects them
      await r2PutJson(env, `designs/${design.id}.json`, design);
    }

    // === 4. Compute cache hash ===
    let hash: string;
    if (body.design_id) {
      hash = await computeExportHash(design.id, design.updated_at, scale, format);
    } else {
      // For inline designs include override and autoImage flag in hash to avoid collisions
      const hashInput = JSON.stringify({
        design,
        size_override: body.size_override ?? null,
        scale,
        format,
      });
      hash = await computeInlineExportHash(hashInput, scale, format);
    }

    // === 5. Cache hit check ===
    const cached = await getCachedExport(hash, format, env);
    if (cached) {
      const url = buildExportUrl(hash, format);

      if (direct) {
        const bytes = await cached.arrayBuffer();
        return new Response(bytes, {
          headers: {
            'Content-Type': format === 'jpeg' ? 'image/jpeg' : 'image/png',
            'X-Cache': 'HIT',
          },
        });
      }

      const result: GenerateResult = {
        url,
        width: renderWidth * scale,
        height: renderHeight * scale,
        format,
        cached: true,
      };
      return jsonResponse(result);
    }

    // === 6. Build render URL for Windmill ===
    const renderUrl = buildRenderUrl(request, design.id);

    // === 7. Call Windmill to capture screenshot ===
    const pngBytes = await runWindmillScreenshot(
      {
        url: renderUrl,
        width: renderWidth,
        height: renderHeight,
        selector: '#thumbnail',
        scale,
      },
      env
    );

    // === 8. Store result in R2 export cache ===
    const exportUrl = await cacheExport(hash, format, pngBytes, env);

    // === 9. Clean up temp design if created for inline_design ===
    if (tempDesignId) {
      // Fire-and-forget cleanup; do not await to avoid blocking response
      env.R2_BUCKET.delete(`designs/${tempDesignId}.json`).catch(() => {});
    }

    // === 10. Return response ===
    if (direct) {
      return new Response(pngBytes, {
        headers: {
          'Content-Type': format === 'jpeg' ? 'image/jpeg' : 'image/png',
          'X-Cache': 'MISS',
        },
      });
    }

    const result: GenerateResult = {
      url: exportUrl,
      width: renderWidth * scale,
      height: renderHeight * scale,
      format,
      cached: false,
    };
    return jsonResponse(result, 200);

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Generate error:', message);

    // Distinguish Windmill errors from general server errors
    if (message.startsWith('Windmill')) {
      return errorResponse(`Screenshot failed: ${message}`, 502);
    }
    return errorResponse(`Generation failed: ${message}`, 500);
  }
}

// === Helpers ===

/**
 * Extract meaningful keywords from design title for Unsplash search.
 * Removes Vietnamese stop words and short tokens.
 */
function extractKeywords(title: string): string {
  return title
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !VI_STOP_WORDS.has(word))
    .slice(0, 4)
    .join(' ');
}

/**
 * Fill empty image param slots (feature_image, image_1…image_4) via Unsplash.
 * Only runs when auto_image=true and UNSPLASH_ACCESS_KEY is configured.
 * Returns updated design (original unchanged if no slots found or no key).
 */
async function fillAutoImages(design: Design, env: Env): Promise<Design> {
  if (!env.UNSPLASH_ACCESS_KEY) return design;

  const title = String(design.params.title ?? '');
  if (!title) return design;

  const keywords = extractKeywords(title);
  if (!keywords) return design;

  // Image param keys to check and fill
  const imageKeys = ['feature_image', 'image_1', 'image_2', 'image_3', 'image_4'];
  const emptySlots = imageKeys.filter(k => !design.params[k]);
  if (emptySlots.length === 0) return design;

  try {
    const results = await searchUnsplash(keywords, emptySlots.length, env);
    if (results.length === 0) return design;

    const updatedParams = { ...design.params };
    results.forEach((img, i) => {
      if (emptySlots[i]) {
        updatedParams[emptySlots[i]] = img.url_full;
      }
    });

    return {
      ...design,
      params: updatedParams,
      updated_at: new Date().toISOString(),
    };
  } catch (err) {
    // Non-fatal: log and continue without images
    console.warn('auto_image Unsplash error:', (err as Error).message);
    return design;
  }
}

/**
 * Build absolute render URL pointing to /api/render?d=<id>.
 * Uses the incoming request's origin so it works in dev and prod.
 */
function buildRenderUrl(request: Request, designId: string): string {
  const origin = new URL(request.url).origin;
  return `${origin}/api/render?d=${encodeURIComponent(designId)}`;
}
