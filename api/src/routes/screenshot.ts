// Screenshot route - captures template render via TonyAPI and returns PNG URL
import type { Env } from '../lib/types';
import { jsonResponse, errorResponse } from '../lib/response-helpers';

const TONYAPI_URL = 'https://tonyapi.vibery.app/windmill/screenshot';

export async function handleScreenshot(url: URL, env: Env): Promise<Response> {
  const templateId = url.searchParams.get('t');
  if (!templateId) {
    return errorResponse('Missing template ID', 400);
  }

  if (!env.TONYAPI_KEY) {
    return errorResponse('TONYAPI_KEY not configured', 500);
  }

  // Build render URL for the template
  const renderUrl = `https://snapkit.vibery.app/api/render?t=${templateId}`;

  try {
    const body = {
      url: renderUrl,
      element: '#thumbnail',
      viewport: { width: 1400, height: 1000 },
      delay: 1500,
    };
    console.log('Screenshot request:', JSON.stringify(body));

    const res = await fetch(TONYAPI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.TONYAPI_KEY}`,
      },
      body: JSON.stringify(body),
    });

    console.log('TonyAPI response status:', res.status);

    if (!res.ok) {
      const text = await res.text();
      console.log('TonyAPI error body:', text);
      return errorResponse(`TonyAPI error: ${text}`, res.status);
    }

    const data = await res.json() as { success: boolean; public_url?: string };
    if (!data.success || !data.public_url) {
      return errorResponse('Screenshot capture failed', 500);
    }

    return jsonResponse({ url: data.public_url });
  } catch (err) {
    return errorResponse(`Screenshot error: ${(err as Error).message}`, 500);
  }
}
