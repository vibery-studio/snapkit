// Route handler: GET/POST/PUT/DELETE /api/templates
// Template CRUD with D1 persistence

import type { Env } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { d1Get, d1All, d1Run, slugify } from '../lib/d1-helpers';
import { getSizeById } from '../data/size-presets';

interface TemplateRow {
  id: string;
  name: string;
  brand: string | null;
  layout: string;
  size: string;
  params: string;
  auto_feature_image: number;
  created_at: string;
  updated_at: string | null;
}

interface TemplateInfo {
  id: string;
  name: string;
  brand: string;
  layout: string;
  size: string;
  dimensions: { width: number; height: number };
  params: Record<string, string>;
  auto_feature_image: boolean;
}

function rowToTemplateInfo(row: TemplateRow): TemplateInfo {
  const size = getSizeById(row.size);
  return {
    id: row.id,
    name: row.name,
    brand: row.brand || '',
    layout: row.layout,
    size: row.size,
    dimensions: { width: size?.w ?? 1280, height: size?.h ?? 720 },
    params: JSON.parse(row.params),
    auto_feature_image: row.auto_feature_image === 1,
  };
}

/**
 * GET /api/templates
 * Returns list of available templates
 */
export async function handleTemplates(env: Env): Promise<Response> {
  try {
    const rows = await d1All<TemplateRow>(env, 'SELECT * FROM templates ORDER BY name');
    const templates = rows.map(rowToTemplateInfo);
    return jsonResponse({ templates });
  } catch (e) {
    console.error('Templates list error:', e);
    return errorResponse(`Failed to list templates: ${(e as Error).message}`, 500);
  }
}

/**
 * GET /api/templates/:id
 * Returns a single template by ID
 */
export async function handleTemplateById(templateId: string, env: Env): Promise<Response> {
  try {
    const row = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [templateId]);
    if (!row) return errorResponse(`Template not found: ${templateId}`, 404);

    const info = rowToTemplateInfo(row);
    return jsonResponse({
      ...info,
      render_url: `https://snapkit.vibery.app/api/render?t=${row.id}`,
    });
  } catch (e) {
    console.error('Template get error:', e);
    return errorResponse(`Failed to get template: ${(e as Error).message}`, 500);
  }
}

/**
 * POST /api/templates
 * Create new template
 */
export async function handleTemplateCreate(request: Request, env: Env): Promise<Response> {
  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  if (!body.name || typeof body.name !== 'string') return errorResponse('name required');
  if (!body.layout || typeof body.layout !== 'string') return errorResponse('layout required');
  if (!body.size || typeof body.size !== 'string') return errorResponse('size required');

  const id = (body.id as string) || slugify(body.name);
  const now = new Date().toISOString();

  await d1Run(
    env,
    `INSERT INTO templates (id, name, brand, layout, size, params, auto_feature_image, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      body.name,
      body.brand || 'goha',
      body.layout,
      body.size,
      JSON.stringify(body.params || {}),
      body.auto_feature_image ? 1 : 0,
      now,
    ]
  );

  const row = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [id]);
  return jsonResponse(row ? rowToTemplateInfo(row) : { id }, 201);
}

/**
 * PUT /api/templates/:id
 * Update existing template
 */
export async function handleTemplateUpdate(templateId: string, request: Request, env: Env): Promise<Response> {
  const existing = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [templateId]);
  if (!existing) return notFoundResponse(`Template not found: ${templateId}`);

  let body: Record<string, unknown>;
  try {
    body = await request.json() as Record<string, unknown>;
  } catch {
    return errorResponse('Invalid JSON');
  }

  const now = new Date().toISOString();
  await d1Run(
    env,
    `UPDATE templates SET name = ?, brand = ?, layout = ?, size = ?, params = ?, auto_feature_image = ?, updated_at = ?
     WHERE id = ?`,
    [
      (body.name as string) ?? existing.name,
      (body.brand as string) ?? existing.brand,
      (body.layout as string) ?? existing.layout,
      (body.size as string) ?? existing.size,
      body.params ? JSON.stringify(body.params) : existing.params,
      body.auto_feature_image !== undefined ? (body.auto_feature_image ? 1 : 0) : existing.auto_feature_image,
      now,
      templateId,
    ]
  );

  const updated = await d1Get<TemplateRow>(env, 'SELECT * FROM templates WHERE id = ?', [templateId]);
  return jsonResponse(updated ? rowToTemplateInfo(updated) : { id: templateId });
}

/**
 * DELETE /api/templates/:id
 */
export async function handleTemplateDelete(templateId: string, env: Env): Promise<Response> {
  await d1Run(env, 'DELETE FROM templates WHERE id = ?', [templateId]);
  return jsonResponse({ deleted: templateId });
}
