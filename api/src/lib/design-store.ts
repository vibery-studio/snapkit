// Design CRUD operations backed by D1 database
import type { Design, Env } from './types';
import { nanoid, d1Get, d1Run } from './d1-helpers';

interface DesignRow {
  id: string;
  size_preset: string;
  size_width: number;
  size_height: number;
  layout: string;
  brand: string | null;
  params: string;
  forked_from: string | null;
  created_at: string;
  updated_at: string;
}

function rowToDesign(row: DesignRow): Design {
  return {
    id: row.id,
    created_at: row.created_at,
    updated_at: row.updated_at,
    size: {
      preset: row.size_preset,
      width: row.size_width,
      height: row.size_height,
    },
    layout: row.layout,
    brand: row.brand ?? '',
    params: JSON.parse(row.params),
    forked_from: row.forked_from ?? undefined,
  };
}

// Save a new design to D1, returns persisted Design with generated ID
export async function saveDesign(
  input: Omit<Design, 'id' | 'created_at' | 'updated_at'>,
  env: Env
): Promise<Design> {
  const id = `d_${nanoid(8)}`;
  const now = new Date().toISOString();

  await d1Run(
    env,
    `INSERT INTO designs (id, size_preset, size_width, size_height, layout, brand, params, forked_from, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      input.size.preset,
      input.size.width,
      input.size.height,
      input.layout,
      input.brand || null,
      JSON.stringify(input.params),
      input.forked_from || null,
      now,
      now,
    ]
  );

  return {
    id,
    created_at: now,
    updated_at: now,
    ...input,
  };
}

// Retrieve design by ID, returns null if not found
export async function getDesign(id: string, env: Env): Promise<Design | null> {
  const row = await d1Get<DesignRow>(
    env,
    'SELECT * FROM designs WHERE id = ?',
    [id]
  );
  return row ? rowToDesign(row) : null;
}

// Update existing design fields; returns updated design or null if not found
export async function updateDesign(
  id: string,
  updates: Partial<Omit<Design, 'id' | 'created_at'>>,
  env: Env
): Promise<Design | null> {
  const existing = await getDesign(id, env);
  if (!existing) return null;

  const now = new Date().toISOString();
  const updated: Design = {
    ...existing,
    ...updates,
    id,
    created_at: existing.created_at,
    updated_at: now,
  };

  await d1Run(
    env,
    `UPDATE designs SET size_preset = ?, size_width = ?, size_height = ?, layout = ?, brand = ?, params = ?, updated_at = ?
     WHERE id = ?`,
    [
      updated.size.preset,
      updated.size.width,
      updated.size.height,
      updated.layout,
      updated.brand || null,
      JSON.stringify(updated.params),
      now,
      id,
    ]
  );

  return updated;
}

// Fork a design: copy with new ID, reset timestamps, track origin via forked_from
export async function forkDesign(id: string, env: Env): Promise<Design | null> {
  const source = await getDesign(id, env);
  if (!source) return null;

  const { id: _id, created_at: _c, updated_at: _u, forked_from: _f, ...rest } = source;

  const forked = await saveDesign({ ...rest, forked_from: id }, env);
  return forked;
}
