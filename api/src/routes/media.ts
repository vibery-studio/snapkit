// Media library CRUD - upload, list, search, delete
import type { Env } from '../lib/types';
import { jsonResponse, errorResponse, notFoundResponse } from '../lib/response-helpers';
import { d1All, d1Get, d1Run } from '../lib/d1-helpers';
import { generateId } from '../lib/r2-helpers';

interface MediaRow {
  id: string;
  name: string;
  url: string;
  thumb_url: string | null;
  source: 'upload' | 'pexels' | 'unsplash';
  tags: string | null;
  width: number | null;
  height: number | null;
  created_at: string;
}

// GET /api/media?q=search&source=pexels&limit=50
export async function handleMediaList(url: URL, env: Env): Promise<Response> {
  const q = url.searchParams.get('q')?.toLowerCase();
  const source = url.searchParams.get('source');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50'), 100);

  let sql = 'SELECT * FROM media';
  const params: string[] = [];
  const conditions: string[] = [];

  if (q) {
    conditions.push('(LOWER(name) LIKE ? OR LOWER(tags) LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (source) {
    conditions.push('source = ?');
    params.push(source);
  }

  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(String(limit));

  const rows = await d1All<MediaRow>(env, sql, params);
  return jsonResponse(rows.map(r => ({
    ...r,
    tags: r.tags ? JSON.parse(r.tags) : [],
  })));
}

// GET /api/media/:id
export async function handleMediaGet(id: string, env: Env): Promise<Response> {
  const row = await d1Get<MediaRow>(env, 'SELECT * FROM media WHERE id = ?', [id]);
  if (!row) return notFoundResponse('Media not found');
  return jsonResponse({ ...row, tags: row.tags ? JSON.parse(row.tags) : [] });
}

// POST /api/media - upload or save from external source
export async function handleMediaCreate(req: Request, env: Env): Promise<Response> {
  const contentType = req.headers.get('content-type') || '';

  // Handle file upload
  if (contentType.includes('multipart/form-data')) {
    const form = await req.formData();
    const file = form.get('file') as File | null;
    if (!file) return errorResponse('No file provided', 400);

    const id = generateId();
    const ext = file.name.split('.').pop() || 'png';
    const key = `media/${id}.${ext}`;

    const buffer = await file.arrayBuffer();
    await env.R2_BUCKET.put(key, buffer, {
      httpMetadata: { contentType: file.type },
    });

    const url = `/r2/${key}`;
    const name = form.get('name')?.toString() || file.name;
    const tags = form.get('tags')?.toString() || '[]';

    await d1Run(env,
      'INSERT INTO media (id, name, url, source, tags) VALUES (?, ?, ?, ?, ?)',
      [id, name, url, 'upload', tags]
    );

    return jsonResponse({ id, name, url, source: 'upload', tags: JSON.parse(tags) }, 201);
  }

  // Handle JSON body (save from Pexels/Unsplash)
  const body = await req.json() as {
    name: string;
    url: string;
    thumb_url?: string;
    source: 'pexels' | 'unsplash';
    tags?: string[];
    width?: number;
    height?: number;
  };

  if (!body.name || !body.url) return errorResponse('name and url required', 400);

  const id = generateId();
  await d1Run(env,
    'INSERT INTO media (id, name, url, thumb_url, source, tags, width, height) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [id, body.name, body.url, body.thumb_url || null, body.source || 'pexels',
     JSON.stringify(body.tags || []), body.width || null, body.height || null]
  );

  return jsonResponse({ id, ...body, tags: body.tags || [] }, 201);
}

// DELETE /api/media/:id
export async function handleMediaDelete(id: string, env: Env): Promise<Response> {
  const row = await d1Get<MediaRow>(env, 'SELECT * FROM media WHERE id = ?', [id]);
  if (!row) return notFoundResponse('Media not found');

  // Delete from R2 if it's an upload
  if (row.source === 'upload' && row.url.startsWith('/r2/')) {
    const key = row.url.replace('/r2/', '');
    await env.R2_BUCKET.delete(key);
  }

  await d1Run(env, 'DELETE FROM media WHERE id = ?', [id]);
  return jsonResponse({ success: true });
}
