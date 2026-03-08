// D1 database helper functions for SnapKit
import type { Env } from './types';

// Workers-compatible nanoid
export function nanoid(size = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, b => chars[b & 63]).join('');
}

export function slugify(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Generic query helpers
export async function d1Get<T>(
  env: Env,
  sql: string,
  params: unknown[] = []
): Promise<T | null> {
  const result = await env.DB.prepare(sql).bind(...params).first<T>();
  return result ?? null;
}

export async function d1All<T>(
  env: Env,
  sql: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await env.DB.prepare(sql).bind(...params).all<T>();
  return result.results ?? [];
}

export async function d1Run(
  env: Env,
  sql: string,
  params: unknown[] = []
): Promise<D1Result> {
  return env.DB.prepare(sql).bind(...params).run();
}
