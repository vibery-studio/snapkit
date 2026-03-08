// R2 bucket helper functions

import type { Env } from './types';

export async function r2Get(env: Env, key: string): Promise<R2ObjectBody | null> {
  return env.R2_BUCKET.get(key);
}

export async function r2GetJson<T>(env: Env, key: string): Promise<T | null> {
  const obj = await env.R2_BUCKET.get(key);
  if (!obj) return null;
  return obj.json<T>();
}

export async function r2Put(
  env: Env,
  key: string,
  body: string | ArrayBuffer | ReadableStream,
  options?: R2PutOptions
): Promise<R2Object> {
  return env.R2_BUCKET.put(key, body, options);
}

export async function r2PutJson(
  env: Env,
  key: string,
  data: unknown,
  customMetadata?: Record<string, string>
): Promise<R2Object> {
  return env.R2_BUCKET.put(key, JSON.stringify(data), {
    httpMetadata: { contentType: 'application/json' },
    customMetadata,
  });
}

export async function r2Delete(env: Env, key: string): Promise<void> {
  await env.R2_BUCKET.delete(key);
}

export async function r2List(
  env: Env,
  options?: R2ListOptions
): Promise<R2Objects> {
  return env.R2_BUCKET.list(options);
}

export async function r2ListByPrefix(
  env: Env,
  prefix: string,
  limit = 100
): Promise<R2Object[]> {
  const result = await env.R2_BUCKET.list({ prefix, limit });
  return result.objects;
}

// Generate unique ID (Workers-compatible, no crypto.randomUUID dependency)
export function generateId(prefix = ''): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = prefix;
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}
