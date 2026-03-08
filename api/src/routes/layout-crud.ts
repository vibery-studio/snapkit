// Layout CRUD API handlers for custom HTML-based layouts stored in D1
import type { Env } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { d1Get, d1All, d1Run, slugify } from '../lib/d1-helpers';
import { validateCustomLayout, type CustomLayoutData } from '../lib/template-engine';
import { LAYOUTS } from '../layouts';

interface LayoutRow {
  id: string;
  name: string;
  categories: string;
  params: string;
  html: string;
  css: string | null;
  created_at: string;
  updated_at: string;
}

function rowToLayout(row: LayoutRow): CustomLayoutData {
  return {
    id: row.id,
    name: row.name,
    categories: JSON.parse(row.categories),
    params: JSON.parse(row.params),
    html: row.html,
    css: row.css || '',
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
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
  const existing = await d1Get<LayoutRow>(env, 'SELECT id FROM layouts WHERE id = ?', [id]);
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

  await d1Run(
    env,
    `INSERT INTO layouts (id, name, categories, params, html, css, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, layout.name, JSON.stringify(layout.categories), JSON.stringify(layout.params), layout.html, layout.css, now, now]
  );

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

  const row = await d1Get<LayoutRow>(env, 'SELECT * FROM layouts WHERE id = ?', [id]);
  if (!row) return notFoundResponse(`Layout "${id}" not found`);

  const existing = rowToLayout(row);
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

  await d1Run(
    env,
    `UPDATE layouts SET name = ?, categories = ?, params = ?, html = ?, css = ?, updated_at = ? WHERE id = ?`,
    [updated.name, JSON.stringify(updated.categories), JSON.stringify(updated.params), updated.html, updated.css, updated.updated_at, id]
  );

  return jsonResponse(updated);
}

// DELETE /api/layouts/:id — Delete custom layout
export async function handleLayoutDelete(id: string, env: Env): Promise<Response> {
  if (LAYOUTS[id]) return errorResponse(`Cannot delete built-in layout "${id}"`, 403);

  const existing = await d1Get<LayoutRow>(env, 'SELECT id FROM layouts WHERE id = ?', [id]);
  if (!existing) return notFoundResponse(`Layout "${id}" not found`);

  await d1Run(env, 'DELETE FROM layouts WHERE id = ?', [id]);
  return jsonResponse({ deleted: id });
}

// GET /api/layouts/:id — Get single layout meta (custom only)
export async function handleLayoutGet(id: string, env: Env): Promise<Response> {
  const row = await d1Get<LayoutRow>(env, 'SELECT * FROM layouts WHERE id = ?', [id]);
  if (!row) return notFoundResponse(`Custom layout "${id}" not found`);
  return jsonResponse(rowToLayout(row));
}

// List all custom layouts from D1
export async function listCustomLayouts(env: Env): Promise<CustomLayoutData[]> {
  try {
    const rows = await d1All<LayoutRow>(env, 'SELECT * FROM layouts ORDER BY name');
    return rows.map(rowToLayout);
  } catch {
    return [];
  }
}
