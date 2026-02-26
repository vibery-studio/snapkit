// Windmill API client for server-side screenshot generation
// Calls Windmill run_wait_result endpoint and decodes base64 PNG response

import type { Env } from './types';

// Extend Env locally — WINDMILL_WORKSPACE may be present as a secret
// without being declared in the shared Env interface yet
interface WindmillEnv extends Env {
  WINDMILL_WORKSPACE?: string;
}

export interface WindmillScreenshotParams {
  url: string;
  width: number;
  height: number;
  selector: string;
  scale: number;
}

interface WindmillJobResult {
  // Windmill run_wait_result returns the script's return value directly
  // Our Python script returns a base64 string
  [key: string]: unknown;
}

/**
 * Call Windmill run_wait_result to execute the thumbnail-screenshot script.
 * Returns PNG image bytes decoded from base64 response.
 *
 * Throws on: Windmill job failure, HTTP error, timeout, missing config.
 */
export async function runWindmillScreenshot(
  params: WindmillScreenshotParams,
  env: Env
): Promise<Uint8Array> {
  const wEnv = env as WindmillEnv;
  if (!wEnv.WINDMILL_BASE || !wEnv.WINDMILL_TOKEN) {
    throw new Error('Windmill not configured: missing WINDMILL_BASE or WINDMILL_TOKEN');
  }

  const workspace = wEnv.WINDMILL_WORKSPACE ?? 'main';
  const scriptPath = 'u/admin/thumbnail-screenshot';

  // run_wait_result blocks until the job completes (up to 30s by default)
  const endpoint = `${wEnv.WINDMILL_BASE}/api/w/${workspace}/jobs/run_wait_result/p/${scriptPath}`;

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${wEnv.WINDMILL_TOKEN}`,
      },
      body: JSON.stringify(params),
      // CF Workers fetch supports signal but not timeout option directly
      // Windmill server handles 30s timeout on its side
    });
  } catch (err) {
    throw new Error(`Windmill network error: ${(err as Error).message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Windmill API error ${res.status}: ${text}`);
  }

  // run_wait_result returns the Python return value as JSON
  // Our script returns a plain base64 string (not wrapped in object)
  const result = await res.json() as string | WindmillJobResult;

  let base64Str: string;
  if (typeof result === 'string') {
    base64Str = result;
  } else if (result && typeof (result as WindmillJobResult)['result'] === 'string') {
    // Some Windmill versions wrap in { result: "..." }
    base64Str = (result as WindmillJobResult)['result'] as string;
  } else {
    throw new Error(`Unexpected Windmill response shape: ${JSON.stringify(result).slice(0, 200)}`);
  }

  return base64ToUint8Array(base64Str);
}

/** Decode a base64 string to Uint8Array (Workers-compatible, no Buffer) */
function base64ToUint8Array(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
