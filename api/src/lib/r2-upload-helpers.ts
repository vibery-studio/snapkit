// Reusable R2 asset upload helpers
// Used by asset-upload.ts and future brand/template upload flows

import type { Env } from './types';
import { r2Put, generateId } from './r2-helpers';

export interface UploadResult {
  key: string;
  url: string;
  contentType: string;
  size: number;
}

export interface UploadOptions {
  maxSize?: number;        // bytes, default 5MB
  allowedTypes?: string[]; // MIME prefixes, default ['image/']
  keyPrefix?: string;      // R2 key prefix, default 'uploads/'
  fileName?: string;       // Override filename
}

const DEFAULT_MAX_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_TYPES = ['image/'];
const DEFAULT_PREFIX = 'uploads/';

// Sanitize prefix to prevent path traversal attacks
// Allows: alphanumeric, '/', '-', '_'. Strips leading '/', '..', etc.
export function sanitizePrefix(prefix: string): string {
  return prefix
    .replace(/\.\./g, '')             // remove ..
    .replace(/[^a-zA-Z0-9/_-]/g, '') // strip invalid chars
    .replace(/^\/+/, '')              // strip leading slashes
    .replace(/\/+/g, '/')             // collapse multiple slashes
    || DEFAULT_PREFIX;
}

// Parse and validate a file from FormData
// Returns { file, formData } on success or { error } on failure
export async function parseUploadFromForm(
  request: Request,
  fieldName = 'file'
): Promise<{ file: File; formData: FormData } | { error: string }> {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return { error: 'Invalid multipart/form-data' };
  }

  const entry = formData.get(fieldName);
  if (!entry) return { error: `Missing field: ${fieldName}` };
  if (typeof entry === 'string') return { error: `Field "${fieldName}" must be a file, not a string` };

  return { file: entry as File, formData };
}

// Validate file against upload constraints
// Returns error string or null if valid
export function validateUploadFile(file: File, options?: UploadOptions): string | null {
  const maxSize = options?.maxSize ?? DEFAULT_MAX_SIZE;
  const allowedTypes = options?.allowedTypes ?? DEFAULT_ALLOWED_TYPES;

  if (file.size === 0) return 'File is empty';
  if (file.size > maxSize) {
    const mb = Math.round(maxSize / 1024 / 1024);
    return `File exceeds ${mb}MB limit (got ${(file.size / 1024 / 1024).toFixed(2)}MB)`;
  }

  const mimeType = file.type || '';
  const allowed = allowedTypes.some((prefix) => mimeType.startsWith(prefix));
  if (!allowed) {
    return `File type "${mimeType}" not allowed. Allowed: ${allowedTypes.join(', ')}`;
  }

  return null;
}

// Generate unique R2 key preserving original file extension
export function generateUploadKey(originalName: string, prefix: string): string {
  const ext = originalName.includes('.') ? originalName.split('.').pop()!.toLowerCase() : '';
  const id = generateId();
  return ext ? `${prefix}${id}.${ext}` : `${prefix}${id}`;
}

// Store file in R2 and return result
// Throws on validation failure or R2 error
export async function storeFileInR2(
  env: Env,
  file: File,
  options?: UploadOptions
): Promise<UploadResult> {
  const validationError = validateUploadFile(file, options);
  if (validationError) throw new Error(validationError);

  const prefix = options?.keyPrefix ?? DEFAULT_PREFIX;
  const safeName = options?.fileName ?? file.name ?? 'upload';
  const key = generateUploadKey(safeName, prefix);
  const buffer = await file.arrayBuffer();

  await r2Put(env, key, buffer, {
    httpMetadata: { contentType: file.type },
  });

  return {
    key,
    url: `/${key}`,
    contentType: file.type,
    size: file.size,
  };
}
