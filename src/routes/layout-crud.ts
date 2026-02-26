// Layout CRUD API handlers for custom HTML-based layouts stored in R2
import type { Env } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { r2GetJson, r2PutJson, r2Delete, r2ListByPrefix } from '../lib/r2-helpers';
import { validateCustomLayout, type CustomLayoutData } from '../lib/template-engine';
import { LAYOUTS } from '../layouts';

const LAYOUT_PREFIX = 'layouts/';

function layoutKey(id: string): string {
  return `${LAYOUT_PREFIX}${id}.json`;
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// POST /api/layouts — Create custom layout
export async function handleLayoutCreate(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  const err = validateCustomLayout(body);
  if (err) return errorResponse(err, 400);

  const id = (typeof body.id === 'string' && body.id) ? body.id : slugify(body.name as string);

  // Cannot overwrite built-in layouts
  if (LAYOUTS[id]) return errorResponse(`Cannot overwrite built-in layout "${id}"`, 409);

  // Check if custom layout already exists
  const existing = await r2GetJson<CustomLayoutData>(env, layoutKey(id));
  if (existing) return errorResponse(`Layout "${id}" already exists. Use PUT to update.`, 409);

  const now = new Date().toISOString();
  const layout: CustomLayoutData = {
    id,
    name: body.name as string,
    categories: body.categories as Array<'landscape' | 'square' | 'portrait' | 'wide'>,
    params: (body.params as CustomLayoutData['params']) || [],
    html: body.html as string,
    css: (body.css as string) || '',
    created_at: now,
    updated_at: now,
  };

  await r2PutJson(env, layoutKey(id), layout);
  return jsonResponse(layout, 201);
}

// PUT /api/layouts/:id — Update custom layout
export async function handleLayoutUpdate(id: string, request: Request, env: Env): Promise<Response> {
  if (LAYOUTS[id]) return errorResponse(`Cannot modify built-in layout "${id}"`, 403);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  const existing = await r2GetJson<CustomLayoutData>(env, layoutKey(id));
  if (!existing) return notFoundResponse(`Layout "${id}" not found`);

  const updated: CustomLayoutData = {
    ...existing,
    name: (body.name as string) ?? existing.name,
    categories: (body.categories as CustomLayoutData['categories']) ?? existing.categories,
    params: (body.params as CustomLayoutData['params']) ?? existing.params,
    html: (body.html as string) ?? existing.html,
    css: body.css !== undefined ? (body.css as string) : existing.css,
    updated_at: new Date().toISOString(),
  };

  const err = validateCustomLayout(updated as unknown as Record<string, unknown>);
  if (err) return errorResponse(err, 400);

  await r2PutJson(env, layoutKey(id), updated);
  return jsonResponse(updated);
}

// DELETE /api/layouts/:id — Delete custom layout
export async function handleLayoutDelete(id: string, env: Env): Promise<Response> {
  if (LAYOUTS[id]) return errorResponse(`Cannot delete built-in layout "${id}"`, 403);

  const existing = await r2GetJson<CustomLayoutData>(env, layoutKey(id));
  if (!existing) return notFoundResponse(`Layout "${id}" not found`);

  await r2Delete(env, layoutKey(id));
  return jsonResponse({ deleted: id });
}

// GET /api/layouts/:id — Get single layout meta (custom only; built-in served from LAYOUTS registry)
export async function handleLayoutGet(id: string, env: Env): Promise<Response> {
  const existing = await r2GetJson<CustomLayoutData>(env, layoutKey(id));
  if (!existing) return notFoundResponse(`Custom layout "${id}" not found`);
  return jsonResponse(existing);
}

// List all custom layouts from R2 (used to merge with built-in for dropdown)
export async function listCustomLayouts(env: Env): Promise<CustomLayoutData[]> {
  try {
    const objects = await r2ListByPrefix(env, LAYOUT_PREFIX, 100);
    const layouts: CustomLayoutData[] = [];
    for (const obj of objects) {
      if (obj.key.endsWith('.json')) {
        const data = await r2GetJson<CustomLayoutData>(env, obj.key);
        if (data) layouts.push(data);
      }
    }
    return layouts;
  } catch {
    return [];
  }
}
