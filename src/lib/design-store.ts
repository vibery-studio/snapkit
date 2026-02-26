// Design CRUD operations backed by R2 storage
import type { Design, Env } from './types';
import { r2GetJson, r2PutJson } from './r2-helpers';

// Workers-compatible nanoid: uses crypto.getRandomValues, no Node deps
function nanoid(size = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b & 63]).join('');
}

function designKey(id: string): string {
  return `designs/${id}.json`;
}

// Save a new design to R2, returns persisted Design with generated ID
export async function saveDesign(
  input: Omit<Design, 'id' | 'created_at' | 'updated_at'>,
  env: Env
): Promise<Design> {
  const id = `d_${nanoid(8)}`;
  const now = new Date().toISOString();

  const design: Design = {
    id,
    created_at: now,
    updated_at: now,
    ...input,
  };

  await r2PutJson(env, designKey(id), design, {
    created_at: now,
    brand: design.brand || 'none',
    layout: design.layout,
  });

  return design;
}

// Retrieve design by ID, returns null if not found
export async function getDesign(id: string, env: Env): Promise<Design | null> {
  return r2GetJson<Design>(env, designKey(id));
}

// Update existing design fields; returns updated design or null if not found
export async function updateDesign(
  id: string,
  updates: Partial<Omit<Design, 'id' | 'created_at'>>,
  env: Env
): Promise<Design | null> {
  const existing = await getDesign(id, env);
  if (!existing) return null;

  const updated: Design = {
    ...existing,
    ...updates,
    id, // id never changes
    created_at: existing.created_at, // preserve original
    updated_at: new Date().toISOString(),
  };

  await r2PutJson(env, designKey(id), updated, {
    created_at: updated.created_at,
    brand: updated.brand || 'none',
    layout: updated.layout,
  });

  return updated;
}

// Fork a design: copy with a new ID and reset timestamps
export async function forkDesign(id: string, env: Env): Promise<Design | null> {
  const source = await getDesign(id, env);
  if (!source) return null;

  const { id: _id, created_at: _c, updated_at: _u, ...rest } = source;
  return saveDesign(rest, env);
}
