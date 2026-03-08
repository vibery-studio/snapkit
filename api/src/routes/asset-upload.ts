// Generic asset upload endpoint
// POST /api/assets/upload — multipart/form-data: file, prefix?, name?
// Stores in R2 and returns { key, url, contentType, size }

import type { Env } from '../lib/types';
import { jsonResponse, errorResponse } from '../lib/response-helpers';
import {
  parseUploadFromForm,
  storeFileInR2,
  sanitizePrefix,
} from '../lib/r2-upload-helpers';

// POST /api/assets/upload
export async function handleAssetUpload(request: Request, env: Env): Promise<Response> {
  const parsed = await parseUploadFromForm(request, 'file');
  if ('error' in parsed) return errorResponse(parsed.error);

  const { file, formData } = parsed;

  // Optional prefix override (sanitized to prevent path traversal)
  const rawPrefix = formData.get('prefix');
  const keyPrefix = typeof rawPrefix === 'string' && rawPrefix.trim()
    ? sanitizePrefix(rawPrefix.trim())
    : 'uploads/';

  // Optional filename override
  const rawName = formData.get('name');
  const fileName = typeof rawName === 'string' && rawName.trim()
    ? rawName.trim()
    : file.name;

  try {
    const result = await storeFileInR2(env, file, { keyPrefix, fileName });
    return jsonResponse(result, 201);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upload failed';
    return errorResponse(message);
  }
}
