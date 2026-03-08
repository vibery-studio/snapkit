// Route handlers for design CRUD: POST/GET/PUT/fork /api/designs
import type { Env } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { saveDesign, getDesign, updateDesign, forkDesign } from '../lib/design-store';
import { getLayoutById } from '../layouts';
import { getSizeById } from '../data/size-presets';

// Validate design input body — returns error string or null if valid
function validateDesignBody(body: any): string | null {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object';
  if (!body.layout || typeof body.layout !== 'string') return 'Missing required field: layout';
  if (!getLayoutById(body.layout)) return `Unknown layout: ${body.layout}`;

  if (!body.size || typeof body.size !== 'object') return 'Missing required field: size';
  if (typeof body.size.preset !== 'string') return 'size.preset must be a string';

  // "custom" preset requires explicit width and height
  if (body.size.preset === 'custom') {
    if (typeof body.size.width !== 'number' || typeof body.size.height !== 'number') {
      return 'Custom size requires numeric size.width and size.height';
    }
  } else {
    const preset = getSizeById(body.size.preset);
    if (!preset) return `Unknown size preset: ${body.size.preset}`;
  }

  if (body.params !== undefined && typeof body.params !== 'object') {
    return 'params must be an object';
  }

  return null;
}

// Resolve size dimensions from body (preset or custom)
function resolveSize(body: any): { preset: string; width: number; height: number } {
  if (body.size.preset === 'custom') {
    return { preset: 'custom', width: body.size.width, height: body.size.height };
  }
  const preset = getSizeById(body.size.preset)!;
  return { preset: preset.id, width: preset.w, height: preset.h };
}

// POST /api/designs — save new design, return { id, url, created_at }
export async function handleDesignCreate(request: Request, env: Env): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const validationError = validateDesignBody(body);
  if (validationError) return errorResponse(validationError, 400);

  try {
    const design = await saveDesign(
      {
        size: resolveSize(body),
        layout: body.layout,
        brand: body.brand ?? null,
        params: body.params ?? {},
      },
      env
    );

    const host = new URL(request.url).origin;
    return jsonResponse(
      { id: design.id, url: `${host}/d/${design.id}`, created_at: design.created_at },
      201
    );
  } catch (e) {
    console.error('Design create error:', e);
    return errorResponse('Failed to save design', 500);
  }
}

// GET /api/designs/:id — return full design JSON
export async function handleDesignGet(designId: string, env: Env): Promise<Response> {
  try {
    const design = await getDesign(designId, env);
    if (!design) return notFoundResponse('Design not found');
    return jsonResponse(design);
  } catch (e) {
    console.error('Design get error:', e);
    return errorResponse('Failed to retrieve design', 500);
  }
}

// POST /api/designs/:id/fork — create a copy of existing design, return new design info
export async function handleDesignFork(designId: string, request: Request, env: Env): Promise<Response> {
  try {
    const forked = await forkDesign(designId, env);
    if (!forked) return notFoundResponse('Source design not found');

    const host = new URL(request.url).origin;
    return jsonResponse(
      { id: forked.id, url: `${host}/d/${forked.id}`, forked_from: forked.forked_from, created_at: forked.created_at },
      201
    );
  } catch (e) {
    console.error('Design fork error:', e);
    return errorResponse('Failed to fork design', 500);
  }
}

// PUT /api/designs/:id — update design fields, return updated design
export async function handleDesignUpdate(
  designId: string,
  request: Request,
  env: Env
): Promise<Response> {
  let body: any;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Invalid JSON body');
  }

  const validationError = validateDesignBody(body);
  if (validationError) return errorResponse(validationError, 400);

  try {
    const updated = await updateDesign(
      designId,
      {
        size: resolveSize(body),
        layout: body.layout,
        brand: body.brand ?? null,
        params: body.params ?? {},
      },
      env
    );

    if (!updated) return notFoundResponse('Design not found');
    return jsonResponse(updated);
  } catch (e) {
    console.error('Design update error:', e);
    return errorResponse('Failed to update design', 500);
  }
}
