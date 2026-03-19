#!/bin/bash
# Visual audit: compare template render against reference image
# Usage: ./audit-template.sh <template-id> <reference-image> [api-url]
# Example: ./audit-template.sh trungnguyen-inner-frame brands/trungnguyen/frame-2.jpg
# Opens side-by-side comparison in browser

set -e

TEMPLATE_ID="${1:?Usage: ./audit-template.sh <template-id> <reference-image> [api-url]}"
REF_IMAGE="${2:?Provide path to reference image}"
API="${3:-http://localhost:8080}"
OUT_DIR="/tmp/snapkit-audit"

mkdir -p "$OUT_DIR"

# Copy reference image
cp "$REF_IMAGE" "$OUT_DIR/reference.jpg"

# Screenshot the rendered template via Playwright
echo "=== Capturing template render ==="
python3 -c "
from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1200, 'height': 1200})
    page.goto('$API/api/render?t=$TEMPLATE_ID')
    page.wait_for_selector('#thumbnail')
    page.wait_for_timeout(2000)
    el = page.query_selector('#thumbnail')
    el.screenshot(path='$OUT_DIR/render.png')
    browser.close()
    print('Screenshot saved')
"

# Generate side-by-side HTML comparison
cat > "$OUT_DIR/compare.html" << 'HTMLEOF'
<!DOCTYPE html>
<html>
<head>
<title>Template Audit</title>
<style>
  body { margin:0; background:#111; color:#fff; font-family:system-ui; }
  h1 { text-align:center; padding:20px 0 10px; font-size:18px; opacity:0.7; }
  .container { display:flex; gap:20px; padding:20px; justify-content:center; align-items:flex-start; }
  .panel { text-align:center; }
  .panel img { max-width:540px; max-height:540px; border:2px solid #333; border-radius:8px; }
  .label { margin-top:8px; font-size:14px; opacity:0.6; }
  .overlay-toggle { text-align:center; margin:10px; }
  button { background:#333; color:#fff; border:none; padding:8px 16px; border-radius:4px; cursor:pointer; font-size:14px; }
  button:hover { background:#555; }
  .overlay-container { position:relative; display:inline-block; }
  .overlay-container img { position:absolute; top:0; left:0; }
  .overlay-container img:first-child { position:relative; }
</style>
</head>
<body>
<h1>Template Audit — Side by Side</h1>
<div class="container">
  <div class="panel">
    <img src="reference.jpg" alt="Reference">
    <div class="label">EXPECTED (Reference)</div>
  </div>
  <div class="panel">
    <img src="render.png" alt="Rendered">
    <div class="label">ACTUAL (Rendered)</div>
  </div>
</div>
<div class="overlay-toggle">
  <button onclick="toggleOverlay()">Toggle Overlay (50% blend)</button>
</div>
<div id="overlay" style="display:none; text-align:center; padding:20px;">
  <div class="overlay-container" style="position:relative; display:inline-block;">
    <img src="reference.jpg" style="max-width:540px; border-radius:8px; position:relative;">
    <img id="overlay-img" src="render.png" style="max-width:540px; border-radius:8px; opacity:0.5; position:absolute; top:0; left:0;">
  </div>
  <div class="label" style="margin-top:8px; opacity:0.6;">OVERLAY (drag slider)</div>
  <input type="range" min="0" max="100" value="50" style="width:300px; margin-top:8px;"
    oninput="document.getElementById('overlay-img').style.opacity = this.value/100">
</div>
<script>
function toggleOverlay() {
  var el = document.getElementById('overlay');
  el.style.display = el.style.display === 'none' ? 'block' : 'none';
}
</script>
</body>
</html>
HTMLEOF

echo "=== Opening comparison ==="
open "$OUT_DIR/compare.html"
echo "Done — compare at $OUT_DIR/compare.html"
