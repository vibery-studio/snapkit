// Route handler for GET /d/:id — loads builder UI with design pre-populated
import type { Env } from '../lib/types';
import { notFoundResponse, errorResponse, htmlResponse } from '../lib/response-helpers';
import { getDesign } from '../lib/design-store';
import type { Design } from '../lib/types';

// Inject design state into builder as a script tag so client JS can hydrate
function designViewerHTML(design: Design): string {
  // Safely serialize design for inline script
  const designJson = JSON.stringify(design).replace(/<\/script>/gi, '<\\/script>');

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapKit — ${escapeAttr(design.id)}</title>
  <meta name="snapkit:design-id" content="${escapeAttr(design.id)}">
  <style>
    body { margin: 0; font-family: sans-serif; background: #0f0f1a; color: #e0e0e0;
           display: flex; align-items: center; justify-content: center; min-height: 100vh; }
    .loading { text-align: center; }
    .loading p { margin-top: 1rem; opacity: 0.6; font-size: 0.9rem; }
    .spinner { width: 48px; height: 48px; border: 3px solid #3a3a5a;
               border-top-color: #FFD700; border-radius: 50%;
               animation: spin 0.8s linear infinite; margin: 0 auto; }
    @keyframes spin { to { transform: rotate(360deg); } }
  </style>
</head>
<body>
  <!-- Pre-injected design state for client hydration -->
  <script id="snapkit-design-data" type="application/json">${designJson}</script>

  <!-- Loading indicator shown until builder JS redirects/hydrates -->
  <div class="loading" id="loading-indicator">
    <div class="spinner"></div>
    <p>Loading design...</p>
  </div>

  <script>
    // Read pre-injected design and redirect to builder with state in query
    (function () {
      try {
        const raw = document.getElementById('snapkit-design-data').textContent;
        const design = JSON.parse(raw);
        // Navigate to builder with design ID so builder can load it
        const dest = new URL('/', location.href);
        dest.searchParams.set('d', design.id);
        location.replace(dest.toString());
      } catch (e) {
        document.getElementById('loading-indicator').innerHTML =
          '<p style="color:#f66">Failed to load design. <a href="/" style="color:#FFD700">Go to builder</a></p>';
      }
    })();
  </script>
</body>
</html>`;
}

function escapeAttr(str: string): string {
  return str.replace(/[&"<>]/g, c => ({ '&': '&amp;', '"': '&quot;', '<': '&lt;', '>': '&gt;' }[c] || c));
}

// GET /d/:id
export async function handleDesignView(designId: string, env: Env): Promise<Response> {
  if (!designId || designId.length < 3) {
    return notFoundResponse('Invalid design ID');
  }

  try {
    const design = await getDesign(designId, env);
    if (!design) return notFoundResponse('Design not found');

    return htmlResponse(designViewerHTML(design));
  } catch (e) {
    console.error('Design viewer error:', e);
    return errorResponse('Failed to load design', 500);
  }
}
