// Builder UI route - serves the interactive thumbnail builder
import { htmlResponse } from '../lib/response-helpers';
import { SIZE_PRESETS } from '../data/size-presets';
import { BRANDS, BRAND_IDS } from '../data/brand-kits';
import { LAYOUTS, LAYOUT_IDS } from '../layouts';
import { GRADIENT_PRESETS } from '../lib/gradient-presets';

export function handleBuilder(): Response {
  return htmlResponse(builderHTML());
}

function builderHTML(): string {
  // Generate size options
  const sizeOptions = SIZE_PRESETS
    .map(s => `<option value="${s.id}">${s.name} (${s.w}×${s.h})</option>`)
    .join('\n            ');

  // Generate brand options
  const brandOptions = BRAND_IDS
    .map(id => `<option value="${id}">${BRANDS[id].name}</option>`)
    .join('\n            ');

  // Generate layout options
  const layoutOptions = LAYOUT_IDS
    .map(id => `<option value="${id}">${LAYOUTS[id].name}</option>`)
    .join('\n            ');

  // Serialize data for client
  const clientData = {
    sizes: SIZE_PRESETS,
    brands: BRANDS,
    layouts: Object.fromEntries(
      Object.entries(LAYOUTS).map(([id, l]) => [id, { id: l.id, name: l.name, categories: l.categories, params: l.params }])
    ),
    gradients: GRADIENT_PRESETS,
  };

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapKit - Thumbnail Builder</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📸</text></svg>">
  <script src="https://unpkg.com/@zumer/snapdom@2.0.2/dist/snapdom.js"></script>
  ${fontFaceCSS()}
  ${appCSS()}
</head>
<body>
  <div class="app">
    <header class="app-header">
      <h1>SnapKit</h1>
      <div class="brand-header-group">
        <select id="brand-select" class="brand-select">
          ${brandOptions}
        </select>
        <button id="brand-manager-btn" class="icon-btn" title="Manage Brands">&#9881;</button>
      </div>
    </header>
    <main class="app-main">
      <aside class="controls">
        <div class="control-group">
          <label for="size-select">Size Preset</label>
          <select id="size-select">
            ${sizeOptions}
            <option value="custom">Custom Size...</option>
          </select>
          <div class="custom-size-inputs hidden" id="custom-size-inputs">
            <div class="control-row" style="margin-top:0.5rem;margin-bottom:0.25rem;">
              <div class="control-group">
                <label for="custom-w">Width (px)</label>
                <input type="number" id="custom-w" min="100" max="4096" value="1200" />
              </div>
              <div class="control-group">
                <label for="custom-h">Height (px)</label>
                <input type="number" id="custom-h" min="100" max="4096" value="630" />
              </div>
            </div>
            <div class="custom-size-category" id="custom-category">Category: landscape</div>
          </div>
        </div>
        <div class="control-group">
          <label for="layout-select">Layout</label>
          <select id="layout-select">
            ${layoutOptions}
          </select>
          <button class="btn-design-template" id="design-template-btn" title="Open Template Designer">Design Template</button>
        </div>
        <div class="control-group">
          <label for="title-input">Title</label>
          <input type="text" id="title-input" placeholder="Nhập tiêu đề..." maxlength="100" />
        </div>
        <div class="control-group">
          <label for="subtitle-input">Subtitle</label>
          <input type="text" id="subtitle-input" placeholder="Nhập phụ đề..." maxlength="150" />
        </div>
        <div class="control-group">
          <label>Background</label>
          <div class="bg-tabs">
            <button class="bg-tab active" data-tab="brand">Brand</button>
            <button class="bg-tab" data-tab="store">Store</button>
            <button class="bg-tab" data-tab="search">Search</button>
            <button class="bg-tab" data-tab="gradient">Gradient</button>
            <button class="bg-tab" data-tab="color">Color</button>
            <button class="bg-tab" data-tab="upload">Upload</button>
          </div>
          <!-- Brand backgrounds panel -->
          <div class="bg-panel" id="bg-brand-panel">
            <div class="bg-grid" id="brand-bg-grid"></div>
            <p class="bg-empty" id="brand-bg-empty" style="display:none">No brand backgrounds available</p>
          </div>
          <!-- Background store panel -->
          <div class="bg-panel hidden" id="bg-store-panel">
            <div class="tag-filter" id="bg-tag-filter">
              <button class="tag-btn active" data-tag="">All</button>
              <button class="tag-btn" data-tag="abstract">Abstract</button>
              <button class="tag-btn" data-tag="nature">Nature</button>
              <button class="tag-btn" data-tag="business">Business</button>
              <button class="tag-btn" data-tag="texture">Texture</button>
            </div>
            <div class="bg-grid" id="store-bg-grid"></div>
            <p class="bg-empty" id="store-bg-empty" style="display:none">No backgrounds found</p>
          </div>
          <!-- Unsplash search panel -->
          <div class="bg-panel hidden" id="bg-search-panel">
            <div class="search-bar">
              <input type="text" id="bg-search-input" placeholder="Search Unsplash..." />
              <button id="bg-unsplash-btn" class="btn-search-sm">Go</button>
            </div>
            <div class="bg-grid" id="search-bg-grid"></div>
            <p class="bg-empty" id="search-bg-empty">Enter keywords to search</p>
            <div class="attribution" id="search-attribution" style="display:none">Photos by <a href="https://unsplash.com" target="_blank">Unsplash</a></div>
          </div>
          <!-- Gradient picker panel -->
          <div class="bg-panel hidden" id="bg-gradient-panel">
            <div class="gradient-presets" id="gradient-preset-grid"></div>
            <div class="gradient-custom">
              <label class="gradient-custom-label">Custom Gradient</label>
              <div class="gradient-direction" id="gradient-direction">
                <button class="dir-btn" data-angle="0" title="Up">↑</button>
                <button class="dir-btn" data-angle="45" title="Up-Right">↗</button>
                <button class="dir-btn" data-angle="90" title="Right">→</button>
                <button class="dir-btn active" data-angle="135" title="Down-Right">↘</button>
                <button class="dir-btn" data-angle="180" title="Down">↓</button>
                <button class="dir-btn" data-angle="225" title="Down-Left">↙</button>
                <button class="dir-btn" data-angle="270" title="Left">←</button>
                <button class="dir-btn" data-angle="315" title="Up-Left">↖</button>
              </div>
              <div class="gradient-stops">
                <input type="color" id="grad-stop-1" value="#667eea" />
                <input type="color" id="grad-stop-2" value="#764ba2" />
              </div>
              <div class="gradient-preview" id="gradient-preview"></div>
              <button id="apply-custom-gradient" class="btn-apply-grad">Apply Gradient</button>
            </div>
          </div>
          <!-- Solid color panel -->
          <div class="bg-panel hidden" id="bg-color-panel">
            <input type="color" id="bg-color" value="#1a1a3e" />
            <div class="color-swatches" id="bg-swatches"></div>
          </div>
          <!-- Upload panel -->
          <div class="bg-panel hidden" id="bg-upload-panel">
            <div class="upload-zone" id="upload-zone">
              <input type="file" id="upload-input" accept="image/*" hidden />
              <div class="upload-label" id="upload-label">
                <span class="upload-icon">+</span>
                <span>Drop image here or click to browse</span>
                <span class="upload-hint">Max 5MB, image files only</span>
              </div>
              <div class="upload-progress hidden" id="upload-progress">
                <div class="spinner-small"></div>
                <span>Uploading...</span>
              </div>
            </div>
            <div class="upload-history" id="upload-history"></div>
          </div>
        </div>
        <div class="control-row">
          <div class="control-group">
            <label for="title-color">Title</label>
            <input type="color" id="title-color" value="#FFD700" />
          </div>
          <div class="control-group">
            <label for="sub-color">Subtitle</label>
            <input type="color" id="sub-color" value="#FFFFFF" />
          </div>
        </div>
        <div class="control-group">
          <label for="overlay-select">Overlay</label>
          <select id="overlay-select">
            <option value="none">None</option>
            <option value="light">Light</option>
            <option value="medium">Medium</option>
            <option value="dark" selected>Dark</option>
          </select>
        </div>
        <div class="control-group" id="logo-control">
          <label>Logo</label>
          <div class="logo-selector" id="logo-selector"></div>
          <div class="logo-position-grid hidden" id="logo-position-grid">
            <button class="pos-btn" data-pos="top-left">TL</button>
            <button class="pos-btn active" data-pos="top-right">TR</button>
            <button class="pos-btn" data-pos="bottom-left">BL</button>
            <button class="pos-btn" data-pos="bottom-right">BR</button>
          </div>
        </div>
        <div class="control-group checkbox-group" id="watermark-control">
          <label>
            <input type="checkbox" id="watermark-toggle" />
            Watermark
            <select id="watermark-opacity" class="small-select">
              <option value="light">Light</option>
              <option value="medium">Medium</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>
        <div id="image-slots"></div>
        <div class="button-group">
          <button id="download-btn" class="btn-primary">Download PNG</button>
          <button id="save-btn" class="btn-secondary">Save Design</button>
          <button id="fork-btn" class="btn-secondary hidden">Fork</button>
        </div>
        <div id="edit-indicator" class="edit-indicator hidden"></div>
        <div class="multi-export-section">
          <button id="multi-export-btn" class="btn-secondary" style="width:100%;margin-top:0.5rem;">Export Multiple Sizes</button>
          <div class="multi-export-panel hidden" id="multi-export-panel">
            <p class="multi-export-hint">Select compatible sizes (same category):</p>
            <div class="multi-export-list" id="multi-export-list"></div>
            <button id="multi-export-go" class="btn-primary" style="width:100%;margin-top:0.75rem;">Export Selected</button>
            <div class="multi-export-progress hidden" id="multi-export-progress">
              <span id="multi-export-status">0/0</span>
            </div>
          </div>
        </div>
      </aside>
      <section class="preview">
        <div class="preview-frame" id="preview-frame"></div>
        <div class="preview-info" id="preview-info">1200 × 630</div>
      </section>
    </main>
  </div>
  <!-- Brand Manager Modal -->
  <div class="modal-overlay hidden" id="brand-manager-modal">
    <div class="modal-content">
      <div class="modal-header">
        <h2>Brand Manager</h2>
        <button id="brand-manager-close" class="icon-btn" title="Close">&times;</button>
      </div>
      <div class="modal-body">
        <div class="bm-sidebar" id="bm-brand-list"></div>
        <div class="bm-main" id="bm-main">
          <p style="color:#6a6a7a;text-align:center;margin-top:2rem;">Select a brand to manage</p>
        </div>
      </div>
    </div>
  </div>
  <!-- Template Designer Modal -->
  <div class="modal-overlay hidden" id="template-designer-modal">
    <div class="modal-content modal-wide" style="max-height:90vh;">
      <div class="modal-header">
        <h2>Template Designer</h2>
        <button id="td-close" class="icon-btn" title="Close">&times;</button>
      </div>
      <div class="td-body">
        <div class="td-sidebar">
          <div class="control-group">
            <label>Layout Name</label>
            <input type="text" id="td-name" placeholder="My Custom Layout" />
          </div>
          <div class="control-group">
            <label>Layout ID (slug)</label>
            <input type="text" id="td-id" placeholder="auto-generated" />
          </div>
          <div class="control-group">
            <label>Categories</label>
            <div class="td-categories" id="td-categories">
              <label><input type="checkbox" value="landscape" checked /> Landscape</label>
              <label><input type="checkbox" value="square" /> Square</label>
              <label><input type="checkbox" value="portrait" /> Portrait</label>
              <label><input type="checkbox" value="wide" /> Wide</label>
            </div>
          </div>
          <div class="control-group">
            <label>Parameters</label>
            <div class="td-params-list" id="td-params-list"></div>
            <button id="td-add-param" class="btn-secondary" style="padding:0.3rem 0.6rem;font-size:0.78rem;margin-top:0.25rem;">+ Add Param</button>
          </div>
          <button id="td-save" class="btn-primary" style="width:100%;margin-top:0.75rem;padding:0.6rem;">Save Layout</button>
          <div class="td-status" id="td-status"></div>
        </div>
        <div class="td-editor">
          <div class="td-editor-tabs">
            <button class="td-tab active" data-tab="html">HTML</button>
            <button class="td-tab" data-tab="css">CSS</button>
          </div>
          <textarea id="td-html" class="td-code" spellcheck="false" placeholder="<div id=&quot;thumbnail&quot; style=&quot;width:{{width}}px;height:{{height}}px;background:{{bg_color}};&quot;>&#10;  <h1 style=&quot;color:{{title_color}}&quot;>{{title}}</h1>&#10;</div>"></textarea>
          <textarea id="td-css" class="td-code hidden" spellcheck="false" placeholder="#thumbnail { display:flex; align-items:center; justify-content:center; }&#10;h1 { font-family:'Montserrat',sans-serif; }"></textarea>
        </div>
        <div class="td-preview">
          <div class="td-preview-label">Live Preview</div>
          <div class="td-preview-wrapper">
            <div id="td-preview-frame" class="td-preview-frame"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <script type="module">
    ${clientScript(clientData)}
  </script>
</body>
</html>`;
}

function fontFaceCSS(): string {
  return `<style>
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-Bold.woff2') format('woff2'); font-weight: 700; font-display: swap; }
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: swap; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: swap; }
  </style>`;
}

function appCSS(): string {
  return `<style>
    *, *::before, *::after { box-sizing: border-box; }
    body { margin: 0; font-family: 'Be Vietnam Pro', -apple-system, sans-serif; background: #0f0f1a; color: #e0e0e0; min-height: 100vh; }
    .app { display: flex; flex-direction: column; min-height: 100vh; }
    .app-header { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; background: #1a1a2e; border-bottom: 1px solid #2a2a4a; }
    .app-header h1 { margin: 0; font-family: 'Montserrat', sans-serif; font-weight: 800; font-size: 1.5rem; color: #FFD700; }
    .brand-header-group { display: flex; align-items: center; gap: 0.5rem; }
    .brand-select { background: #1a1a3e; color: #FFD700; border: 1px solid #3a3a5a; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; }
    /* Brand Manager Modal */
    .icon-btn { background: none; border: 1px solid #3a3a5a; color: #a0a0b0; font-size: 1.1rem; cursor: pointer; padding: 0.35rem 0.6rem; border-radius: 6px; line-height: 1; transition: color 0.15s, border-color 0.15s; }
    .icon-btn:hover { color: #FFD700; border-color: #FFD700; }
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.75); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-overlay.hidden { display: none; }
    .modal-content { background: #1a1a2e; border-radius: 12px; width: 92%; max-width: 820px; max-height: 84vh; overflow: hidden; display: flex; flex-direction: column; border: 1px solid #2a2a4a; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-bottom: 1px solid #2a2a4a; flex-shrink: 0; }
    .modal-header h2 { margin: 0; font-size: 1.15rem; color: #FFD700; font-family: 'Montserrat', sans-serif; font-weight: 700; }
    .modal-body { display: grid; grid-template-columns: 190px 1fr; flex: 1; overflow: hidden; min-height: 0; }
    .bm-sidebar { padding: 0.75rem; border-right: 1px solid #2a2a4a; overflow-y: auto; background: #12121f; }
    .bm-main { padding: 1.25rem; overflow-y: auto; }
    .bm-brand-item { padding: 0.5rem 0.6rem; border-radius: 6px; cursor: pointer; margin-bottom: 0.2rem; font-size: 0.88rem; color: #c0c0d0; transition: background 0.1s; }
    .bm-brand-item:hover { background: #2a2a4a; color: #e0e0e0; }
    .bm-brand-item.active { background: #2a2a4a; color: #FFD700; font-weight: 600; }
    .bm-add-btn { width: 100%; margin-top: 0.5rem; padding: 0.45rem; background: #2a2a4a; border: 1px dashed #4a4a6a; border-radius: 6px; color: #a0a0b0; cursor: pointer; font-size: 0.82rem; text-align: center; }
    .bm-add-btn:hover { border-color: #FFD700; color: #FFD700; }
    .bm-section { margin-bottom: 1.5rem; }
    .bm-section-title { font-size: 0.78rem; font-weight: 700; color: #6a6a7a; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.6rem; }
    .bm-form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; margin-bottom: 0.6rem; }
    .bm-form-group { display: flex; flex-direction: column; gap: 0.25rem; }
    .bm-form-group label { font-size: 0.75rem; color: #8a8aaa; font-weight: 600; }
    .bm-form-group input[type="text"] { padding: 0.45rem 0.6rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 5px; color: #e0e0e0; font-size: 0.88rem; font-family: inherit; }
    .bm-form-group input[type="text"]:focus { outline: none; border-color: #FFD700; }
    .bm-form-group input[type="color"] { height: 34px; width: 100%; padding: 2px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 5px; cursor: pointer; }
    .bm-save-btn { padding: 0.5rem 1.2rem; background: linear-gradient(135deg, #FFD700, #FF6B35); border: none; border-radius: 6px; color: #1a1a3e; font-weight: 700; font-size: 0.88rem; cursor: pointer; font-family: 'Montserrat', sans-serif; }
    .bm-save-btn:hover { opacity: 0.9; }
    .bm-asset-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.45rem; margin-top: 0.5rem; }
    .bm-asset-item { position: relative; border-radius: 6px; overflow: hidden; aspect-ratio: 1; background: #0f0f1a; border: 1px solid #3a3a5a; }
    .bm-asset-item img { width: 100%; height: 100%; object-fit: contain; display: block; }
    .bm-asset-item.bg-thumb img { object-fit: cover; }
    .bm-asset-delete { position: absolute; top: 3px; right: 3px; background: rgba(180,30,30,0.85); color: #fff; border: none; border-radius: 50%; width: 20px; height: 20px; font-size: 0.65rem; cursor: pointer; display: none; align-items: center; justify-content: center; line-height: 1; }
    .bm-asset-item:hover .bm-asset-delete { display: flex; }
    .bm-upload-btn { display: flex; align-items: center; justify-content: center; aspect-ratio: 1; border: 1px dashed #4a4a6a; border-radius: 6px; background: #0f0f1a; color: #6a6a7a; font-size: 1.5rem; cursor: pointer; transition: border-color 0.15s, color 0.15s; }
    .bm-upload-btn:hover { border-color: #FFD700; color: #FFD700; }
    .bm-watermark-preview { width: 80px; height: 80px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; overflow: hidden; display: flex; align-items: center; justify-content: center; }
    .bm-watermark-preview img { width: 100%; height: 100%; object-fit: contain; }
    .bm-status { font-size: 0.78rem; color: #6a6a7a; margin-top: 0.35rem; min-height: 1.1em; }
    .app-main { display: grid; grid-template-columns: 340px 1fr; flex: 1; }
    .controls { background: #1a1a2e; padding: 1.5rem; overflow-y: auto; border-right: 1px solid #2a2a4a; }
    .control-group { margin-bottom: 1.25rem; }
    .control-group label { display: block; margin-bottom: 0.5rem; font-weight: 600; font-size: 0.85rem; color: #a0a0b0; }
    .control-group input[type="text"], .control-group select { width: 100%; padding: 0.625rem 0.75rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-family: inherit; font-size: 0.95rem; }
    .control-group input:focus, .control-group select:focus { outline: none; border-color: #FFD700; }
    .control-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 1.25rem; }
    .control-row .control-group { margin-bottom: 0; }
    .control-group input[type="color"] { width: 100%; height: 40px; padding: 2px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; cursor: pointer; }
    .checkbox-group label { display: flex; align-items: center; gap: 0.5rem; cursor: pointer; color: #e0e0e0; }
    .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; accent-color: #FFD700; }
    /* Background tabs: 6 tabs, compact */
    .bg-tabs { display: flex; gap: 0.15rem; margin-bottom: 0.75rem; flex-wrap: wrap; }
    .bg-tab { flex: 1; min-width: 0; padding: 0.35rem 0.1rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 5px; color: #a0a0b0; cursor: pointer; font-size: 0.68rem; text-align: center; }
    .bg-tab.active { background: #2a2a4a; color: #FFD700; border-color: #FFD700; }
    .bg-panel { display: flex; gap: 0.5rem; flex-wrap: wrap; width: 100%; }
    .bg-panel.hidden { display: none; }
    /* Background thumbnail grid */
    .bg-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.35rem; width: 100%; max-height: 210px; overflow-y: auto; }
    .bg-grid-item { aspect-ratio: 16/9; border-radius: 5px; overflow: hidden; cursor: pointer; border: 2px solid transparent; position: relative; background: #1a1a3e; }
    .bg-grid-item:hover { border-color: #FFD700; }
    .bg-grid-item.active { border-color: #FFD700; box-shadow: 0 0 0 1px #FFD700; }
    .bg-grid-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .bg-grid-item .author { position: absolute; bottom: 0; left: 0; right: 0; font-size: 0.58rem; padding: 2px 3px; background: rgba(0,0,0,0.65); color: #ddd; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .bg-empty { font-size: 0.78rem; color: #6a6a7a; width: 100%; margin: 0.4rem 0; text-align: center; }
    /* Tag filter buttons */
    .tag-filter { display: flex; gap: 0.2rem; flex-wrap: wrap; margin-bottom: 0.4rem; width: 100%; }
    .tag-btn { padding: 0.15rem 0.4rem; font-size: 0.68rem; border-radius: 10px; border: 1px solid #3a3a5a; background: #0f0f1a; color: #a0a0b0; cursor: pointer; }
    .tag-btn.active { background: #FFD700; color: #1a1a3e; border-color: #FFD700; }
    /* Unsplash search bar */
    .search-bar { display: flex; gap: 0.35rem; width: 100%; margin-bottom: 0.4rem; }
    .search-bar input { flex: 1; padding: 0.4rem 0.55rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-family: inherit; font-size: 0.85rem; }
    .search-bar input:focus { outline: none; border-color: #FFD700; }
    .btn-search-sm { padding: 0.4rem 0.6rem; background: #2a2a4a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; cursor: pointer; font-size: 0.78rem; white-space: nowrap; }
    .btn-search-sm:hover { background: #3a3a5a; }
    .attribution { font-size: 0.7rem; color: #6a6a7a; width: 100%; margin-top: 0.25rem; }
    .attribution a { color: #a0a0b0; }
    /* Gradient picker */
    .gradient-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.35rem; width: 100%; margin-bottom: 0.6rem; }
    .gradient-swatch { height: 32px; border-radius: 5px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.1s; }
    .gradient-swatch:hover, .gradient-swatch.active { border-color: #FFD700; }
    .gradient-custom { width: 100%; }
    .gradient-custom-label { display: block; font-size: 0.75rem; color: #a0a0b0; font-weight: 600; margin-bottom: 0.35rem; }
    .gradient-direction { display: flex; gap: 0.15rem; margin-bottom: 0.45rem; }
    .dir-btn { flex: 1; height: 28px; border-radius: 4px; border: 1px solid #3a3a5a; background: #0f0f1a; color: #a0a0b0; cursor: pointer; font-size: 0.8rem; display: flex; align-items: center; justify-content: center; padding: 0; }
    .dir-btn.active { background: #FFD700; color: #1a1a3e; border-color: #FFD700; }
    .gradient-stops { display: flex; gap: 0.4rem; margin-bottom: 0.4rem; }
    .gradient-stops input { flex: 1; height: 32px; padding: 2px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; cursor: pointer; }
    .gradient-preview { height: 38px; border-radius: 6px; border: 1px solid #3a3a5a; margin-bottom: 0.4rem; background: linear-gradient(135deg, #667eea, #764ba2); }
    .btn-apply-grad { width: 100%; padding: 0.4rem; background: #2a2a4a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; cursor: pointer; font-size: 0.82rem; }
    .btn-apply-grad:hover { background: #3a3a5a; }
    /* Solid color swatches */
    .color-swatches { display: flex; gap: 0.25rem; margin-top: 0.5rem; flex-wrap: wrap; width: 100%; }
    .color-swatch { width: 28px; height: 28px; border-radius: 4px; border: 2px solid transparent; cursor: pointer; }
    .color-swatch:hover { border-color: #fff; }
    .button-group { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
    .btn-primary { flex: 1; padding: 0.875rem 1rem; background: linear-gradient(135deg, #FFD700, #FF6B35); border: none; border-radius: 8px; color: #1a1a3e; font-family: 'Montserrat', sans-serif; font-weight: 700; font-size: 1rem; cursor: pointer; transition: transform 0.15s, box-shadow 0.15s; }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3); }
    .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
    .btn-secondary { flex: 1; padding: 0.875rem 1rem; background: #2a2a4a; border: 1px solid #3a3a5a; border-radius: 8px; color: #e0e0e0; font-family: 'Montserrat', sans-serif; font-weight: 600; cursor: pointer; }
    .btn-secondary:hover { background: #3a3a5a; }
    .preview { display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem; background: #12121f; }
    .preview-frame { display: flex; align-items: flex-start; justify-content: center; max-width: 100%; overflow: hidden; border-radius: 8px; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4); }
    .preview-info { margin-top: 1rem; color: #6a6a7a; font-size: 0.85rem; font-weight: 600; }
    @media (max-width: 900px) { .app-main { grid-template-columns: 1fr; } .controls { border-right: none; border-bottom: 1px solid #2a2a4a; max-height: 50vh; } }
    .upload-zone { border: 2px dashed #3a3a5a; border-radius: 8px; padding: 2rem 1rem; text-align: center; cursor: pointer; transition: border-color 0.2s, background 0.2s; width: 100%; }
    .upload-zone.dragover { border-color: #FFD700; background: rgba(255, 215, 0, 0.05); }
    .upload-label { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .upload-icon { font-size: 2rem; color: #6a6a7a; }
    .upload-label span { color: #a0a0b0; font-size: 0.85rem; }
    .upload-hint { font-size: 0.75rem !important; color: #6a6a7a !important; }
    .upload-progress { display: flex; align-items: center; gap: 0.5rem; justify-content: center; }
    .upload-progress.hidden { display: none; }
    .spinner-small { width: 20px; height: 20px; border: 2px solid #3a3a5a; border-top-color: #FFD700; border-radius: 50%; animation: spin 0.8s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .upload-history { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 1rem; max-height: 120px; overflow-y: auto; width: 100%; }
    .upload-history-item { aspect-ratio: 16/9; border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; }
    .upload-history-item:hover { border-color: #FFD700; }
    .upload-history-item img { width: 100%; height: 100%; object-fit: cover; }
    #bg-upload-panel { flex-direction: column; }
    .logo-selector { display: flex; gap: 0.4rem; flex-wrap: wrap; margin-bottom: 0.5rem; }
    .logo-option { display: flex; align-items: center; gap: 0.25rem; cursor: pointer; padding: 4px; border-radius: 4px; border: 2px solid transparent; }
    .logo-option:has(input:checked) { border-color: #FFD700; background: rgba(255,215,0,0.08); }
    .logo-option input[type="radio"] { accent-color: #FFD700; width: 14px; height: 14px; }
    .logo-option img { height: 28px; max-width: 72px; object-fit: contain; background: #2a2a4a; border-radius: 4px; padding: 3px; }
    .logo-none-label { color: #a0a0b0; font-size: 0.8rem; }
    .logo-position-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.25rem; max-width: 96px; }
    .logo-position-grid.hidden { display: none; }
    .pos-btn { padding: 0.4rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 4px; color: #a0a0b0; cursor: pointer; font-size: 0.7rem; font-weight: 600; }
    .pos-btn.active { background: #FFD700; color: #1a1a3e; border-color: #FFD700; }
    .small-select { padding: 0.2rem 0.4rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 4px; color: #e0e0e0; font-size: 0.78rem; margin-left: 0.5rem; }
    .image-slot { margin-bottom: 1rem; }
    .image-slot > label { display: block; margin-bottom: 0.4rem; font-weight: 600; font-size: 0.82rem; color: #a0a0b0; }
    .image-slot-preview { height: 72px; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; overflow: hidden; margin-bottom: 0.4rem; display: flex; align-items: center; justify-content: center; }
    .image-slot-preview img { width: 100%; height: 100%; object-fit: cover; }
    .image-slot-preview span { color: #6a6a7a; font-size: 0.78rem; }
    .image-slot-search input[type="text"] { width: 100%; padding: 0.5rem 0.6rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-size: 0.88rem; }
    .image-slot-results { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.25rem; margin-top: 0.4rem; }
    .image-slot-results .bg-grid-item { aspect-ratio: 16/9; border-radius: 4px; overflow: hidden; cursor: pointer; border: 2px solid transparent; }
    .image-slot-results .bg-grid-item:hover { border-color: #FFD700; }
    .image-slot-results .bg-grid-item img { width: 100%; height: 100%; object-fit: cover; }
    /* Custom size inputs */
    .custom-size-inputs { margin-top: 0.25rem; }
    .custom-size-inputs.hidden { display: none; }
    .custom-size-inputs input[type="number"] { width: 100%; padding: 0.625rem 0.75rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-family: inherit; font-size: 0.95rem; }
    .custom-size-inputs input[type="number"]:focus { outline: none; border-color: #FFD700; }
    .custom-size-category { font-size: 0.75rem; color: #6a6a7a; margin-top: 0.25rem; }
    .btn-secondary.hidden { display: none; }
    .edit-indicator { margin-top: 0.5rem; padding: 0.4rem 0.6rem; background: #1a2a1a; border: 1px solid #2a4a2a; border-radius: 6px; font-size: 0.75rem; color: #6ac96a; font-weight: 600; }
    .edit-indicator.hidden { display: none; }
    /* Multi-export panel */
    .multi-export-section { margin-top: 0.25rem; }
    .multi-export-panel { margin-top: 0.5rem; padding: 0.75rem; background: #12121f; border: 1px solid #2a2a4a; border-radius: 8px; }
    .multi-export-panel.hidden { display: none; }
    .multi-export-hint { font-size: 0.8rem; color: #a0a0b0; margin: 0 0 0.5rem; }
    .multi-export-list { max-height: 180px; overflow-y: auto; }
    .multi-export-item { display: flex; align-items: center; gap: 0.5rem; padding: 0.35rem 0; cursor: pointer; font-size: 0.82rem; color: #e0e0e0; }
    .multi-export-item input[type="checkbox"] { accent-color: #FFD700; width: 14px; height: 14px; flex-shrink: 0; }
    .multi-export-progress { margin-top: 0.5rem; text-align: center; font-size: 0.85rem; color: #FFD700; font-weight: 600; }
    .multi-export-progress.hidden { display: none; }
    /* Template Designer Modal */
    .modal-wide { max-width: 1200px; width: 96%; }
    .td-body { display: grid; grid-template-columns: 220px 1fr 1fr; flex: 1; overflow: hidden; min-height: 500px; }
    .td-sidebar { padding: 1rem; border-right: 1px solid #2a2a4a; overflow-y: auto; background: #12121f; }
    .td-sidebar .control-group { margin-bottom: 1rem; }
    .td-sidebar .control-group label { font-size: 0.8rem; color: #a0a0b0; font-weight: 600; display: block; margin-bottom: 0.4rem; }
    .td-sidebar input[type="text"] { width: 100%; padding: 0.5rem 0.6rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #e0e0e0; font-family: inherit; font-size: 0.88rem; }
    .td-sidebar input[type="text"]:focus { outline: none; border-color: #FFD700; }
    .td-categories { display: flex; flex-direction: column; gap: 0.3rem; }
    .td-categories label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.82rem; color: #c0c0d0; font-weight: 400; cursor: pointer; }
    .td-categories input[type="checkbox"] { accent-color: #FFD700; }
    .td-params-list { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 0.5rem; }
    .td-param-row { display: grid; grid-template-columns: 1fr 80px 20px; gap: 0.25rem; align-items: center; }
    .td-param-row input, .td-param-row select { padding: 0.3rem 0.4rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 4px; color: #e0e0e0; font-size: 0.75rem; font-family: inherit; width: 100%; }
    .td-param-row input:focus, .td-param-row select:focus { outline: none; border-color: #FFD700; }
    .td-param-remove { background: none; border: none; color: #6a6a7a; cursor: pointer; font-size: 1rem; line-height: 1; padding: 0; }
    .td-param-remove:hover { color: #f66; }
    .td-editor { display: flex; flex-direction: column; border-right: 1px solid #2a2a4a; overflow: hidden; }
    .td-editor-tabs { display: flex; border-bottom: 1px solid #2a2a4a; flex-shrink: 0; }
    .td-tab { flex: 1; padding: 0.5rem; background: none; border: none; color: #a0a0b0; cursor: pointer; border-bottom: 2px solid transparent; font-size: 0.85rem; transition: color 0.15s; }
    .td-tab.active { color: #FFD700; border-bottom-color: #FFD700; }
    .td-tab:hover { color: #e0e0e0; }
    .td-code { flex: 1; background: #0a0a14; color: #e0e0e0; border: none; padding: 1rem; font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace; font-size: 0.82rem; resize: none; line-height: 1.6; tab-size: 2; outline: none; }
    .td-code.hidden { display: none; }
    .td-preview { padding: 1rem; overflow: auto; background: #0f0f1a; display: flex; flex-direction: column; align-items: center; gap: 0.75rem; }
    .td-preview-label { font-size: 0.75rem; color: #6a6a7a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; align-self: flex-start; }
    .td-preview-frame { transform-origin: top left; }
    .td-preview-wrapper { width: 100%; overflow: hidden; display: flex; align-items: flex-start; justify-content: center; flex: 1; }
    .td-status { font-size: 0.78rem; margin-top: 0.5rem; min-height: 1.1em; color: #6a6a7a; }
    .btn-design-template { padding: 0.35rem 0.7rem; background: #2a2a4a; border: 1px solid #4a4a6a; border-radius: 6px; color: #a0a0b0; cursor: pointer; font-size: 0.78rem; white-space: nowrap; margin-top: 0.4rem; width: 100%; text-align: center; }
    .btn-design-template:hover { border-color: #FFD700; color: #FFD700; }
  </style>`;
}

function clientScript(data: object): string {
  return `
    const DATA = ${JSON.stringify(data)};

    // Layout render functions (must match server-side)
    const esc = s => s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : '';
    const safeColor = (c, fallback) => (c && /^#[0-9a-fA-F]{3,8}$|^rgb|^linear-gradient|^radial-gradient/.test(c)) ? c : fallback;
    const logoPositionMap = { 'top-left':'top:5%;left:5%','top-right':'top:5%;right:5%','bottom-left':'bottom:5%;left:5%','bottom-right':'bottom:5%;right:5%' };
    const logoHtml = (p, defaultPos) => {
      if (!p.logo) return '';
      const pos = logoPositionMap[p.logo_position] || defaultPos || logoPositionMap['top-right'];
      return \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${pos};height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />\`;
    };
    const watermarkHtml = (p) => {
      if (!p.watermark_url) return '';
      const op = {'light':'0.2','medium':'0.4','dark':'0.6'}[p.watermark_opacity||'light']||'0.2';
      return \`<img src="\${p.watermark_url}" alt="" style="position:absolute;bottom:3%;right:3%;height:6%;max-width:20%;object-fit:contain;opacity:\${op};pointer-events:none;z-index:10;" crossorigin="anonymous" onerror="this.style.display='none'" />\`;
    };

    const RENDERERS = {
      'overlay-center': (p) => {
        const overlay = { none: '', light: 'linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)),', medium: 'linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),', dark: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),' }[p.overlay || 'none'] || '';
        const bgStyle = p.bg_image ? \`background:\${overlay}url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${safeColor(p.bg_color,'#1a1a3e')}\`;
        const titleColor = safeColor(p.title_color, '#FFD700');
        const subColor = safeColor(p.subtitle_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">\${esc(p.title)}</h1>\${sub}\${watermarkHtml(p)}</div>\`;
      },
      'split-left': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;right:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div>\${watermarkHtml(p)}</div>\`;
      },
      'split-right': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div>\${watermarkHtml(p)}</div>\`;
      },
      'overlay-bottom': (p) => {
        const fallbackBg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const barColor = safeColor(p.bar_color, '#000000');
        const bgStyle = p.bg_image ? \`background:url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${fallbackBg}\`;
        const sub = p.subtitle ? \`<p style="position:relative;color:\${titleColor};font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="position:absolute;bottom:0;left:0;right:0;height:30%;padding:0 6%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;"><div style="position:absolute;inset:0;background:\${barColor};opacity:0.88;"></div><h1 style="position:relative;color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;">\${esc(p.title)}</h1>\${sub}</div>\${watermarkHtml(p)}</div>\`;
      },
      'card-center': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${titleColor};font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:100%;height:60%;position:relative;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:100%;height:40%;background:\${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6% 8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div>\${watermarkHtml(p)}</div>\`;
      },
      'text-only': (p) => {
        const bgStart = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const subColor = safeColor(p.subtitle_color, '#FFD700');
        const bgStyle = p.gradient_end ? \`background:linear-gradient(135deg,\${bgStart} 0%,\${safeColor(p.gradient_end,bgStart)} 100%)\` : \`background:\${bgStart}\`;
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">\${logoHtml(p,'bottom:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;">\${esc(p.title)}</h1>\${sub}\${watermarkHtml(p)}</div>\`;
      },
      'collage-2': (p) => {
        const bg = safeColor(p.bg_color, '#111111');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;background:\${bg};display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%;padding:3% 5%;box-sizing:border-box;overflow:hidden;"><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_1||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_2||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div></div><div style="height:22%;display:flex;align-items:center;justify-content:center;padding:0 6%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);"><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;">\${esc(p.title)}</h1></div>\${watermarkHtml(p)}</div>\`;
      },
      'frame': (p) => {
        const frameColor = safeColor(p.frame_color, '#FFD700');
        const inset = Math.round(Math.min(p.width, p.height) * 0.03);
        const framePosMap = { 'top-left':'top:calc(3% + 1em);left:calc(3% + 1em)', 'top-right':'top:calc(3% + 1em);right:calc(3% + 1em)', 'bottom-left':'bottom:calc(3% + 1em);left:calc(3% + 1em)', 'bottom-right':'bottom:calc(3% + 1em);right:calc(3% + 1em)' };
        const logoPos = framePosMap[p.logo_position] || framePosMap['bottom-right'];
        const logo = p.logo ? \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${logoPos};height:8%;max-width:25%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:#000;"><img src="\${p.feature_image||''}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /><div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 \${inset}px \${frameColor};z-index:2;"></div>\${logo}\${watermarkHtml(p)}</div>\`;
      },
    };

    // State
    const state = {
      size: DATA.sizes[0],
      layout: 'overlay-center',
      brand: DATA.brands.goha,
      title: 'Tối ưu content B2B cho AI',
      subtitle: 'Cuộc cách mạng tìm kiếm đa bước',
      bg_color: '#1a1a3e',
      bg_image: '',
      title_color: '#FFD700',
      subtitle_color: '#FFFFFF',
      overlay: 'dark',
      logo_id: null,        // selected logo id from brand (null = none)
      logo_position: 'top-right',
      watermark: false,
      watermark_opacity: 'light',
      feature_images: {},   // { feature_image: url, image_1: url, image_2: url }
    };

    function render() {
      const renderer = RENDERERS[state.layout];
      if (!renderer) return;
      const selectedLogo = state.logo_id ? state.brand.logos.find(l => l.id === state.logo_id) : null;
      const watermarkUrl = (state.watermark && state.brand.watermark) ? state.brand.watermark.url : null;
      const html = renderer({
        width: state.size.w,
        height: state.size.h,
        title: state.title,
        subtitle: state.subtitle,
        bg_color: state.bg_color,
        bg_image: state.bg_image,
        title_color: state.title_color,
        subtitle_color: state.subtitle_color,
        overlay: state.overlay,
        logo: selectedLogo ? selectedLogo.url : null,
        logo_position: state.logo_position,
        watermark_url: watermarkUrl,
        watermark_opacity: state.watermark_opacity,
        feature_image: state.feature_images.feature_image || null,
        image_1: state.feature_images.image_1 || null,
        image_2: state.feature_images.image_2 || null,
      });
      document.getElementById('preview-frame').innerHTML = html;
      updateScale();
      document.getElementById('preview-info').textContent = \`\${state.size.w} × \${state.size.h}\`;
    }

    function updateScale() {
      const frame = document.getElementById('preview-frame');
      const thumb = document.getElementById('thumbnail');
      if (!thumb) return;
      const maxW = frame.parentElement.clientWidth - 64;
      const maxH = window.innerHeight - 250;
      const scale = Math.min(maxW / state.size.w, maxH / state.size.h, 1);
      thumb.style.transform = \`scale(\${scale})\`;
      thumb.style.transformOrigin = 'top left';
      frame.style.width = \`\${state.size.w * scale}px\`;
      frame.style.height = \`\${state.size.h * scale}px\`;
    }

    function applyBrand(brand) {
      state.brand = brand;
      state.bg_color = brand.colors.primary;
      state.title_color = brand.colors.secondary;
      state.subtitle_color = brand.colors.text_light;
      // Default to first logo on brand change
      state.logo_id = brand.logos && brand.logos.length > 0 ? brand.logos[0].id : null;
      // Show/hide watermark control based on brand
      const wmCtrl = document.getElementById('watermark-control');
      if (wmCtrl) wmCtrl.style.display = brand.watermark ? '' : 'none';
      document.getElementById('bg-color').value = brand.colors.primary;
      document.getElementById('title-color').value = brand.colors.secondary;
      document.getElementById('sub-color').value = brand.colors.text_light;
      renderSwatches(brand);
      renderLogoSelector();
      renderBrandBgGrid(brand);
      if (bgStoreLoaded) loadBgStore(document.querySelector('.tag-btn.active')?.dataset.tag || '');
      render();
    }

    // Logo selector renderer (stub — full implementation in logo/watermark phase)
    function renderLogoSelector() {}

    function renderSwatches(brand) {
      const container = document.getElementById('bg-swatches');
      container.innerHTML = Object.values(brand.colors).map(c => \`<div class="color-swatch" style="background:\${c}" data-color="\${c}"></div>\`).join('');
      container.querySelectorAll('.color-swatch').forEach(el => {
        el.addEventListener('click', () => { state.bg_color = el.dataset.color; document.getElementById('bg-color').value = el.dataset.color; render(); });
      });
    }

    function debounce(fn, ms = 100) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

    // ── Background panel helpers ──────────────────────────────────────────────

    // Apply a background image URL or CSS gradient string
    function applyBgImage(url) {
      state.bg_image = url;
      document.querySelectorAll('.bg-grid-item').forEach(el => el.classList.remove('active'));
      render();
    }
    function applyBgGradient(css) {
      state.bg_color = css;
      state.bg_image = '';
      document.querySelectorAll('.bg-grid-item, .gradient-swatch').forEach(el => el.classList.remove('active'));
      render();
    }

    // Brand backgrounds grid
    function renderBrandBgGrid(brand) {
      const grid = document.getElementById('brand-bg-grid');
      const empty = document.getElementById('brand-bg-empty');
      const bgs = brand.backgrounds || [];
      if (!bgs.length) { grid.innerHTML = ''; empty.style.display = 'block'; return; }
      empty.style.display = 'none';
      grid.innerHTML = bgs.map(bg => \`
        <div class="bg-grid-item" data-url="\${bg.url}" title="\${bg.name||''}">
          <img src="\${bg.url}" alt="\${bg.name||''}" loading="lazy" />
        </div>
      \`).join('');
      grid.querySelectorAll('.bg-grid-item').forEach(el => el.addEventListener('click', () => applyBgImage(el.dataset.url)));
    }

    // Background store grid
    let bgStoreLoaded = false;
    async function loadBgStore(tag) {
      const grid = document.getElementById('store-bg-grid');
      const empty = document.getElementById('store-bg-empty');
      grid.innerHTML = '<div class="bg-empty">Loading...</div>';
      empty.style.display = 'none';
      try {
        const tagParam = tag ? \`&tag=\${encodeURIComponent(tag)}\` : '';
        const res = await fetch(\`/api/backgrounds?brand=\${state.brand.id}&limit=24\${tagParam}\`);
        const data = await res.json();
        const bgs = data.backgrounds || [];
        if (!bgs.length) {
          grid.innerHTML = '';
          empty.textContent = tag ? \`No "\${tag}" backgrounds\` : 'Store is empty';
          empty.style.display = 'block';
          return;
        }
        grid.innerHTML = bgs.map(bg => \`
          <div class="bg-grid-item" data-url="\${bg.url}" title="\${bg.name||bg.category}">
            <img src="\${bg.url}" alt="\${bg.name||bg.category}" loading="lazy" />
          </div>
        \`).join('');
        grid.querySelectorAll('.bg-grid-item').forEach(el => el.addEventListener('click', () => applyBgImage(el.dataset.url)));
      } catch {
        grid.innerHTML = '';
        empty.textContent = 'Failed to load';
        empty.style.display = 'block';
      }
    }

    // Unsplash search grid
    async function searchUnsplash(query) {
      if (!query.trim()) return;
      const grid = document.getElementById('search-bg-grid');
      const empty = document.getElementById('search-bg-empty');
      const attr = document.getElementById('search-attribution');
      grid.innerHTML = '<div class="bg-empty">Searching...</div>';
      empty.style.display = 'none';
      attr.style.display = 'none';
      try {
        const res = await fetch(\`/api/search/images?q=\${encodeURIComponent(query)}&per_page=9\`);
        const data = await res.json();
        const results = data.results || [];
        if (!results.length) {
          grid.innerHTML = '';
          empty.textContent = \`No results for "\${query}"\`;
          empty.style.display = 'block';
          return;
        }
        grid.innerHTML = results.map(img => \`
          <div class="bg-grid-item" data-url="\${img.url_full}" title="Photo by \${img.author}">
            <img src="\${img.url_thumb}" alt="\${img.author}" loading="lazy" />
            <span class="author">\${img.author}</span>
          </div>
        \`).join('');
        grid.querySelectorAll('.bg-grid-item').forEach(el => el.addEventListener('click', () => applyBgImage(el.dataset.url)));
        attr.style.display = 'block';
      } catch {
        grid.innerHTML = '';
        empty.textContent = 'Search failed';
        empty.style.display = 'block';
      }
    }

    // Gradient preset grid
    function renderGradientPresets() {
      const grid = document.getElementById('gradient-preset-grid');
      grid.innerHTML = DATA.gradients.map(g => \`
        <div class="gradient-swatch" data-css="\${g.css}" title="\${g.name}" style="background:\${g.css}"></div>
      \`).join('');
      grid.querySelectorAll('.gradient-swatch').forEach(el => {
        el.addEventListener('click', () => {
          document.querySelectorAll('.gradient-swatch').forEach(s => s.classList.remove('active'));
          el.classList.add('active');
          applyBgGradient(el.dataset.css);
        });
      });
    }

    // Custom gradient builder
    let gradAngle = 135;
    function buildCustomGrad() {
      const c1 = document.getElementById('grad-stop-1').value;
      const c2 = document.getElementById('grad-stop-2').value;
      const hexRe = /^#[0-9a-fA-F]{3,8}$/;
      const s1 = hexRe.test(c1) ? c1 : '#667eea';
      const s2 = hexRe.test(c2) ? c2 : '#764ba2';
      return \`linear-gradient(\${Math.round(gradAngle) % 360}deg, \${s1}, \${s2})\`;
    }
    function updateGradPreview() {
      document.getElementById('gradient-preview').style.background = buildCustomGrad();
    }

    // ── Custom size ───────────────────────────────────────────────────────────

    function updateCustomSize() {
      const rawW = parseInt(document.getElementById('custom-w').value, 10) || 1200;
      const rawH = parseInt(document.getElementById('custom-h').value, 10) || 630;
      const w = Math.min(4096, Math.max(100, rawW));
      const h = Math.min(4096, Math.max(100, rawH));
      const ratio = w / h;
      let category = 'landscape';
      if (ratio < 0.7) category = 'portrait';
      else if (ratio > 0.9 && ratio < 1.1) category = 'square';
      else if (ratio > 2) category = 'wide';
      state.size = { id: 'custom', name: \`Custom (\${w}×\${h})\`, w, h, category };
      const catEl = document.getElementById('custom-category');
      if (catEl) catEl.textContent = \`Category: \${category}\`;
      render();
    }

    // ── Multi-size export ─────────────────────────────────────────────────────

    function populateMultiExportList() {
      const currentCategory = state.size.category;
      const compatible = DATA.sizes.filter(s => s.category === currentCategory && s.id !== state.size.id);
      const container = document.getElementById('multi-export-list');
      if (!container) return;
      if (compatible.length === 0) {
        container.innerHTML = '<p style="color:#6a6a7a;font-size:0.8rem;margin:0;">No other compatible sizes for this category.</p>';
        return;
      }
      container.innerHTML = compatible.map(s => \`
        <label class="multi-export-item">
          <input type="checkbox" value="\${s.id}" checked />
          <span>\${s.name} (\${s.w}×\${s.h})</span>
        </label>
      \`).join('');
    }

    async function runMultiExport() {
      const checkboxes = document.querySelectorAll('#multi-export-list input[type="checkbox"]:checked');
      const selectedIds = Array.from(checkboxes).map(cb => cb.value);
      if (selectedIds.length === 0) return;

      const sizes = selectedIds.map(id => DATA.sizes.find(s => s.id === id)).filter(Boolean);
      const progressEl = document.getElementById('multi-export-progress');
      const statusEl = document.getElementById('multi-export-status');
      const goBtn = document.getElementById('multi-export-go');

      progressEl.classList.remove('hidden');
      goBtn.disabled = true;

      // Include current size first, then selected others
      const allSizes = [state.size, ...sizes];
      const savedSize = state.size;

      for (let i = 0; i < allSizes.length; i++) {
        statusEl.textContent = \`\${i + 1}/\${allSizes.length}\`;
        const sz = allSizes[i];
        state.size = sz;
        render();
        await document.fonts.ready;
        await new Promise(r => setTimeout(r, 250));
        try {
          const thumbEl = document.getElementById('thumbnail');
          const origT = thumbEl.style.transform;
          const origO = thumbEl.style.transformOrigin;
          thumbEl.style.transform = 'none';
          thumbEl.style.transformOrigin = '';
          const result = await window.snapdom(thumbEl);
          const blob = await result.toBlob({ type: 'image/png', scale: 2 });
          thumbEl.style.transform = origT;
          thumbEl.style.transformOrigin = origO;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = \`snapkit-\${sz.id}-\${Date.now()}.png\`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          // Small delay to avoid browser throttling sequential downloads
          await new Promise(r => setTimeout(r, 150));
        } catch (err) {
          console.error(\`Export \${sz.id} failed:\`, err);
        }
      }

      // Restore original size
      state.size = savedSize;
      render();
      goBtn.disabled = false;
      statusEl.textContent = 'Done!';
      setTimeout(() => { progressEl.classList.add('hidden'); }, 2500);
    }

    function bind() {
      document.getElementById('size-select').addEventListener('change', e => {
        const val = e.target.value;
        const customPanel = document.getElementById('custom-size-inputs');
        if (val === 'custom') {
          customPanel.classList.remove('hidden');
          updateCustomSize();
        } else {
          customPanel.classList.add('hidden');
          state.size = DATA.sizes.find(s => s.id === val);
          render();
        }
      });
      document.getElementById('custom-w').addEventListener('input', debounce(updateCustomSize, 200));
      document.getElementById('custom-h').addEventListener('input', debounce(updateCustomSize, 200));
      document.getElementById('layout-select').addEventListener('change', async e => {
        state.layout = e.target.value;
        state.feature_images = {};
        renderImageSlots();
        // Fetch custom renderer if not already cached, then render
        if (!RENDERERS[state.layout]) {
          await fetchCustomRenderer(state.layout);
        }
        render();
      });
      document.getElementById('brand-select').addEventListener('change', e => { applyBrand(DATA.brands[e.target.value]); });
      document.getElementById('title-input').addEventListener('input', debounce(e => { state.title = e.target.value; render(); }));
      document.getElementById('subtitle-input').addEventListener('input', debounce(e => { state.subtitle = e.target.value; render(); }));
      document.getElementById('bg-color').addEventListener('input', e => { state.bg_color = e.target.value; state.bg_image = ''; render(); });
      document.getElementById('title-color').addEventListener('input', e => { state.title_color = e.target.value; render(); });
      document.getElementById('sub-color').addEventListener('input', e => { state.subtitle_color = e.target.value; render(); });
      document.getElementById('overlay-select').addEventListener('change', e => { state.overlay = e.target.value; render(); });
      // Watermark controls
      document.getElementById('watermark-toggle').addEventListener('change', e => { state.watermark = e.target.checked; render(); });
      document.getElementById('watermark-opacity').addEventListener('change', e => { state.watermark_opacity = e.target.value; if (state.watermark) render(); });
      // Logo position grid (delegated click on container)
      document.getElementById('logo-position-grid').addEventListener('click', e => {
        const btn = e.target.closest('.pos-btn');
        if (!btn) return;
        document.querySelectorAll('.pos-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        state.logo_position = btn.dataset.pos;
        render();
      });
      // Background tab switching (6 tabs)
      const BG_PANELS = ['brand','store','search','gradient','color','upload'];
      document.querySelectorAll('.bg-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.bg-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const active = tab.dataset.tab;
          BG_PANELS.forEach(p => {
            document.getElementById(\`bg-\${p}-panel\`).classList.toggle('hidden', p !== active);
          });
          if (active === 'store' && !bgStoreLoaded) { bgStoreLoaded = true; loadBgStore(''); }
          if (active === 'search') { setTimeout(() => document.getElementById('bg-search-input').focus(), 50); }
        });
      });
      // Tag filter (store panel)
      document.querySelectorAll('.tag-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.tag-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          loadBgStore(btn.dataset.tag);
        });
      });
      // Unsplash search
      const bgSearchInput = document.getElementById('bg-search-input');
      const debouncedUnsplash = debounce(() => searchUnsplash(bgSearchInput.value), 500);
      bgSearchInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); searchUnsplash(bgSearchInput.value); } else { debouncedUnsplash(); } });
      document.getElementById('bg-unsplash-btn').addEventListener('click', () => searchUnsplash(bgSearchInput.value));
      // Gradient picker
      document.querySelectorAll('.dir-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          document.querySelectorAll('.dir-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          gradAngle = parseInt(btn.dataset.angle, 10);
          updateGradPreview();
        });
      });
      document.getElementById('grad-stop-1').addEventListener('input', updateGradPreview);
      document.getElementById('grad-stop-2').addEventListener('input', updateGradPreview);
      document.getElementById('apply-custom-gradient').addEventListener('click', () => applyBgGradient(buildCustomGrad()));
      updateGradPreview();
      window.addEventListener('resize', debounce(updateScale, 150));
      // Multi-export panel toggle
      document.getElementById('multi-export-btn').addEventListener('click', () => {
        const panel = document.getElementById('multi-export-panel');
        panel.classList.toggle('hidden');
        if (!panel.classList.contains('hidden')) populateMultiExportList();
      });
      // Multi-export go
      document.getElementById('multi-export-go').addEventListener('click', runMultiExport);
    }

    // Render logo radio buttons from current brand logos
    function renderLogoSelector() {
      const container = document.getElementById('logo-selector');
      if (!container) return;
      const logos = state.brand.logos || [];
      const posGrid = document.getElementById('logo-position-grid');
      container.innerHTML = \`
        <label class="logo-option">
          <input type="radio" name="logo" value="" \${!state.logo_id ? 'checked' : ''} />
          <span class="logo-none-label">None</span>
        </label>
        \${logos.map(l => \`
          <label class="logo-option">
            <input type="radio" name="logo" value="\${l.id}" \${state.logo_id === l.id ? 'checked' : ''} />
            <img src="\${l.url}" alt="\${l.name}" title="\${l.name}" />
          </label>
        \`).join('')}
      \`;
      container.querySelectorAll('input[name="logo"]').forEach(radio => {
        radio.addEventListener('change', e => {
          state.logo_id = e.target.value || null;
          if (posGrid) posGrid.classList.toggle('hidden', !state.logo_id);
          render();
        });
      });
      if (posGrid) posGrid.classList.toggle('hidden', !state.logo_id);
    }

    // Render image slot controls for the current layout's image params (excludes bg_image)
    function renderImageSlots() {
      const layout = DATA.layouts[state.layout];
      const imageParams = layout ? layout.params.filter(p => p.type === 'image' && p.key !== 'bg_image') : [];
      const container = document.getElementById('image-slots');
      if (!container) return;
      if (imageParams.length === 0) { container.innerHTML = ''; return; }

      container.innerHTML = imageParams.map(param => \`
        <div class="image-slot">
          <label>\${param.label}</label>
          <div class="image-slot-preview" id="preview-\${param.key}">
            \${state.feature_images[param.key]
              ? \`<img src="\${state.feature_images[param.key]}" />\`
              : '<span>No image selected</span>'}
          </div>
          <div class="image-slot-search">
            <input type="text"
              placeholder="\${param.searchable ? 'Search Unsplash...' : 'Image URL...'}"
              data-key="\${param.key}"
              data-searchable="\${param.searchable ? '1' : ''}"
              value="\${!param.searchable ? (state.feature_images[param.key] || '') : ''}" />
            <div class="image-slot-results" id="results-\${param.key}"></div>
          </div>
        </div>
      \`).join('');

      container.querySelectorAll('.image-slot-search input[type="text"]').forEach(input => {
        if (input.dataset.searchable) {
          input.addEventListener('input', debounce(async e => {
            const key = e.target.dataset.key;
            const q = e.target.value.trim();
            const grid = document.getElementById(\`results-\${key}\`);
            if (!grid) return;
            if (!q) { grid.innerHTML = ''; return; }
            try {
              const res = await fetch(\`/api/search?q=\${encodeURIComponent(q)}&per_page=6\`);
              const data = await res.json();
              grid.innerHTML = (data.results || []).map(img => \`
                <div class="bg-grid-item" data-url="\${img.url_full}" data-key="\${key}">
                  <img src="\${img.url_thumb}" loading="lazy" />
                </div>
              \`).join('');
              grid.querySelectorAll('.bg-grid-item').forEach(item => {
                item.addEventListener('click', () => {
                  state.feature_images[item.dataset.key] = item.dataset.url;
                  render();
                  renderImageSlots();
                });
              });
            } catch (err) { console.error('Image search error', err); }
          }, 400));
        } else {
          input.addEventListener('input', debounce(e => {
            state.feature_images[e.target.dataset.key] = e.target.value.trim();
            render();
          }, 300));
        }
      });
    }

    async function downloadPNG() {
      const btn = document.getElementById('download-btn');
      btn.disabled = true; btn.textContent = 'Capturing...';
      try {
        await document.fonts.ready;
        const thumb = document.getElementById('thumbnail');
        const origT = thumb.style.transform, origO = thumb.style.transformOrigin;
        thumb.style.transform = 'none'; thumb.style.transformOrigin = '';
        const result = await window.snapdom(thumb);
        const blob = await result.toBlob({ type: 'image/png', scale: 2 });
        thumb.style.transform = origT; thumb.style.transformOrigin = origO;
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = \`snapkit-\${state.size.id}-\${Date.now()}.png\`;
        document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
        btn.textContent = 'Downloaded!'; setTimeout(() => { btn.textContent = 'Download PNG'; }, 2000);
      } catch (e) { console.error(e); btn.textContent = 'Error'; setTimeout(() => { btn.textContent = 'Download PNG'; }, 2000); }
      finally { btn.disabled = false; }
    }

    // Tracks if we're editing a saved design (null = new design)
    let currentDesignId = null;

    function hydrateFromDesign(design) {
      // Size
      const sizePreset = DATA.sizes.find(s => s.id === design.size.preset);
      if (sizePreset) {
        state.size = sizePreset;
        document.getElementById('size-select').value = sizePreset.id;
        document.getElementById('custom-size-inputs').classList.add('hidden');
      } else if (design.size.preset === 'custom') {
        state.size = { id: 'custom', name: \`Custom (\${design.size.width}x\${design.size.height})\`, w: design.size.width, h: design.size.height, category: 'landscape' };
        document.getElementById('size-select').value = 'custom';
        document.getElementById('custom-size-inputs').classList.remove('hidden');
        document.getElementById('custom-w').value = design.size.width;
        document.getElementById('custom-h').value = design.size.height;
      }

      // Layout
      if (design.layout && DATA.layouts[design.layout]) {
        state.layout = design.layout;
        document.getElementById('layout-select').value = design.layout;
      }

      // Brand — call applyBrand to sync colors/logos/swatches
      const brandId = design.brand;
      if (brandId && DATA.brands[brandId]) {
        applyBrand(DATA.brands[brandId]);
        document.getElementById('brand-select').value = brandId;
      }

      // Params
      const p = design.params || {};
      state.title = p.title || '';
      state.subtitle = p.subtitle || '';
      state.bg_color = p.bg_color || state.brand.colors.primary;
      state.bg_image = p.bg_image || '';
      state.title_color = p.title_color || state.brand.colors.secondary;
      state.subtitle_color = p.subtitle_color || state.brand.colors.text_light;
      state.overlay = p.overlay || 'dark';
      state.showLogo = p.showLogo !== false && p.showLogo !== 'false';

      // Sync form text/color controls
      document.getElementById('title-input').value = state.title;
      document.getElementById('subtitle-input').value = state.subtitle;
      document.getElementById('bg-color').value = /^#[0-9a-fA-F]{3,8}$/.test(state.bg_color) ? state.bg_color : '#1a1a3e';
      document.getElementById('title-color').value = /^#[0-9a-fA-F]{3,8}$/.test(state.title_color) ? state.title_color : '#FFD700';
      document.getElementById('sub-color').value = /^#[0-9a-fA-F]{3,8}$/.test(state.subtitle_color) ? state.subtitle_color : '#FFFFFF';
      document.getElementById('overlay-select').value = state.overlay;

      // Logo & watermark
      if (p.logo_id !== undefined) state.logo_id = p.logo_id || null;
      if (p.logo_position) state.logo_position = p.logo_position;
      if (p.watermark !== undefined) state.watermark = p.watermark === true || p.watermark === 'true';
      if (p.watermark_opacity) state.watermark_opacity = p.watermark_opacity;

      // Feature images
      state.feature_images = {};
      ['feature_image', 'image_1', 'image_2', 'image_3', 'image_4'].forEach(key => {
        if (p[key]) state.feature_images[key] = p[key];
      });

      // Re-render logo selector to reflect restored logo_id
      renderLogoSelector();
      // Re-render image slots for the loaded layout
      renderImageSlots();

      // Show fork button + edit indicator
      document.getElementById('fork-btn').classList.remove('hidden');
      const indicator = document.getElementById('edit-indicator');
      indicator.classList.remove('hidden');
      indicator.textContent = \`Editing: \${design.id}\`;

      // Update save button label
      document.getElementById('save-btn').textContent = 'Update Design';

      render();
    }

    async function saveDesign() {
      const btn = document.getElementById('save-btn');
      btn.disabled = true;
      btn.textContent = currentDesignId ? 'Updating...' : 'Saving...';
      try {
        const design = {
          size: { preset: state.size.id, width: state.size.w, height: state.size.h },
          layout: state.layout,
          brand: state.brand.id,
          params: {
            title: state.title, subtitle: state.subtitle,
            bg_color: state.bg_color, bg_image: state.bg_image,
            title_color: state.title_color, subtitle_color: state.subtitle_color,
            overlay: state.overlay, showLogo: state.showLogo,
            logo_id: state.logo_id, logo_position: state.logo_position,
            watermark: state.watermark, watermark_opacity: state.watermark_opacity,
            ...state.feature_images,
          },
        };

        let res;
        if (currentDesignId) {
          res = await fetch(\`/api/designs/\${currentDesignId}\`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(design),
          });
        } else {
          res = await fetch('/api/designs', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(design),
          });
        }

        if (!res.ok) throw new Error('Save failed');
        const result = await res.json();

        if (!currentDesignId) {
          // First save: update URL and track ID, show fork button
          currentDesignId = result.id;
          window.history.replaceState(null, '', \`/?d=\${result.id}\`);
          btn.textContent = 'Update Design';
          document.getElementById('fork-btn').classList.remove('hidden');
          const indicator = document.getElementById('edit-indicator');
          indicator.classList.remove('hidden');
          indicator.textContent = \`Editing: \${result.id}\`;
        }

        const shareUrl = \`\${location.origin}/d/\${currentDesignId}\`;
        await navigator.clipboard.writeText(shareUrl);
        btn.textContent = 'Copied URL!';
        setTimeout(() => { btn.textContent = 'Update Design'; }, 2000);
      } catch (e) {
        console.error(e);
        btn.textContent = 'Error';
        setTimeout(() => { btn.textContent = currentDesignId ? 'Update Design' : 'Save Design'; }, 2000);
      } finally {
        btn.disabled = false;
      }
    }

    // ── Upload drag-drop logic ────────────────────────────────────────────────
    const UPLOAD_MAX_SIZE = 5 * 1024 * 1024;
    const UPLOAD_HISTORY_KEY = 'snapkit_upload_history';

    function loadUploadHistory() {
      try { return JSON.parse(localStorage.getItem(UPLOAD_HISTORY_KEY) || '[]'); } catch { return []; }
    }
    function saveUploadHistory(urls) {
      try { localStorage.setItem(UPLOAD_HISTORY_KEY, JSON.stringify(urls.slice(0, 12))); } catch {}
    }

    function renderUploadHistory() {
      const urls = loadUploadHistory();
      const container = document.getElementById('upload-history');
      if (!container) return;
      container.innerHTML = urls.map((url, i) =>
        \`<div class="upload-history-item" data-idx="\${i}"><img src="\${url}" loading="lazy" /></div>\`
      ).join('');
      container.querySelectorAll('.upload-history-item').forEach(el => {
        el.addEventListener('click', () => {
          const urls2 = loadUploadHistory();
          const idx = parseInt(el.dataset.idx, 10);
          state.bg_image = urls2[idx];
          render();
        });
      });
    }

    function showUploadError(msg) {
      const label = document.getElementById('upload-label');
      if (!label) return;
      const orig = label.innerHTML;
      label.innerHTML = \`<span style="color:#f66">\${msg}</span>\`;
      setTimeout(() => { label.innerHTML = orig; }, 3000);
    }

    async function handleUploadFile(file) {
      if (!file.type.startsWith('image/')) { showUploadError('Only image files accepted'); return; }
      if (file.size > UPLOAD_MAX_SIZE) { showUploadError('File exceeds 5MB limit'); return; }
      const label = document.getElementById('upload-label');
      const progress = document.getElementById('upload-progress');
      label.classList.add('hidden');
      progress.classList.remove('hidden');
      try {
        const form = new FormData();
        form.append('file', file);
        const res = await fetch('/api/backgrounds/upload', { method: 'POST', body: form });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || 'Upload failed');
        }
        const { url } = await res.json();
        state.bg_image = url;
        render();
        const urls = loadUploadHistory();
        urls.unshift(url);
        saveUploadHistory(urls);
        renderUploadHistory();
        const uploadInput = document.getElementById('upload-input');
        if (uploadInput) uploadInput.value = '';
      } catch (e) {
        showUploadError(e.message);
      } finally {
        label.classList.remove('hidden');
        progress.classList.add('hidden');
      }
    }

    function initUploadZone() {
      const zone = document.getElementById('upload-zone');
      const input = document.getElementById('upload-input');
      if (!zone || !input) return;
      zone.addEventListener('click', e => { if (e.target === zone || e.target.closest('.upload-label') || e.target.closest('.upload-progress')) input.click(); });
      input.addEventListener('change', e => { if (e.target.files[0]) handleUploadFile(e.target.files[0]); });
      zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
      zone.addEventListener('dragleave', e => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('dragover'); });
      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file) handleUploadFile(file);
      });
      renderUploadHistory();
    }

    document.getElementById('download-btn').addEventListener('click', downloadPNG);
    document.getElementById('save-btn').addEventListener('click', saveDesign);
    document.getElementById('fork-btn').addEventListener('click', async () => {
      if (!currentDesignId) return;
      const btn = document.getElementById('fork-btn');
      btn.disabled = true;
      btn.textContent = 'Forking...';
      try {
        const res = await fetch(\`/api/designs/\${currentDesignId}/fork\`, { method: 'POST' });
        if (!res.ok) throw new Error('Fork failed');
        const { id } = await res.json();
        window.location.href = \`/?d=\${id}\`;
      } catch (e) {
        console.error(e);
        btn.textContent = 'Error';
        setTimeout(() => { btn.textContent = 'Fork'; btn.disabled = false; }, 2000);
      }
    });

    // ── Brand Manager ─────────────────────────────────────────────────────────

    // Refresh the brand dropdown from API (picks up newly created R2 brands)
    async function refreshBrandDropdown() {
      try {
        const res = await fetch('/api/brands');
        const { brands } = await res.json();
        const sel = document.getElementById('brand-select');
        if (!sel) return;
        const currentVal = sel.value;
        sel.innerHTML = brands.map(b => \`<option value="\${b.id}">\${b.name}</option>\`).join('');
        // Restore selection if still valid
        if (brands.find(b => b.id === currentVal)) sel.value = currentVal;
        // Update DATA.brands cache with fetched brands
        brands.forEach(b => { if (!DATA.brands[b.id]) DATA.brands[b.id] = b; });
      } catch (e) {
        console.error('refreshBrandDropdown failed:', e);
      }
    }

    // Open modal and render brand list sidebar
    async function openBrandManager() {
      document.getElementById('brand-manager-modal').classList.remove('hidden');
      document.getElementById('bm-main').innerHTML = '<p style="color:#6a6a7a;text-align:center;margin-top:2rem;">Loading...</p>';
      await renderBmBrandList();
    }

    function closeBrandManager() {
      document.getElementById('brand-manager-modal').classList.add('hidden');
    }

    async function renderBmBrandList() {
      const sidebar = document.getElementById('bm-brand-list');
      try {
        const res = await fetch('/api/brands');
        const { brands } = await res.json();
        sidebar.innerHTML = brands.map(b => \`
          <div class="bm-brand-item" data-id="\${b.id}">\${b.name}</div>
        \`).join('') + \`<button class="bm-add-btn" id="bm-create-btn">+ New Brand</button>\`;
        sidebar.querySelectorAll('.bm-brand-item').forEach(el => {
          el.addEventListener('click', () => {
            sidebar.querySelectorAll('.bm-brand-item').forEach(i => i.classList.remove('active'));
            el.classList.add('active');
            selectBrandForManage(el.dataset.id);
          });
        });
        document.getElementById('bm-create-btn').addEventListener('click', renderBmCreateForm);
      } catch (e) {
        sidebar.innerHTML = '<p style="color:#f66;font-size:0.8rem;padding:0.5rem;">Failed to load</p>';
      }
    }

    // Render full brand edit form + asset grids for a brand
    async function selectBrandForManage(brandId) {
      const main = document.getElementById('bm-main');
      main.innerHTML = '<p style="color:#6a6a7a;text-align:center;margin-top:2rem;">Loading...</p>';
      try {
        const res = await fetch(\`/api/brands/\${brandId}\`);
        if (!res.ok) throw new Error('Not found');
        const kit = await res.json();
        main.innerHTML = renderBmBrandPanel(kit);
        bindBmBrandPanel(kit);
      } catch (e) {
        main.innerHTML = '<p style="color:#f66;text-align:center;margin-top:2rem;">Failed to load brand</p>';
      }
    }

    function renderBmBrandPanel(kit) {
      const colorFields = [
        { key: 'primary', label: 'Primary' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'accent', label: 'Accent' },
        { key: 'text_light', label: 'Text Light' },
        { key: 'text_dark', label: 'Text Dark' },
      ];
      const logos = kit.logos || [];
      const backgrounds = kit.backgrounds || [];
      const wm = kit.watermark;

      return \`
        <div class="bm-section">
          <div class="bm-section-title">Brand Details</div>
          <div class="bm-form-row">
            <div class="bm-form-group">
              <label>Name</label>
              <input type="text" id="bm-name" value="\${kit.name}" />
            </div>
            <div class="bm-form-group">
              <label>Heading Font</label>
              <input type="text" id="bm-font-heading" value="\${kit.fonts?.heading || ''}" />
            </div>
          </div>
          <div class="bm-form-row" style="grid-template-columns:repeat(5,1fr);">
            \${colorFields.map(f => \`
              <div class="bm-form-group">
                <label>\${f.label}</label>
                <input type="color" id="bm-color-\${f.key}" value="\${kit.colors?.[f.key] || '#000000'}" />
              </div>
            \`).join('')}
          </div>
          <button class="bm-save-btn" id="bm-save-meta">Save Changes</button>
          <div class="bm-status" id="bm-meta-status"></div>
        </div>

        <div class="bm-section">
          <div class="bm-section-title">Logos</div>
          <div class="bm-asset-grid" id="bm-logo-grid">
            \${logos.map(l => \`
              <div class="bm-asset-item" data-logo-id="\${l.id}" title="\${l.name}">
                <img src="\${l.url}" alt="\${l.name}" />
                <button class="bm-asset-delete" data-delete-logo="\${l.id}" title="Delete">&times;</button>
              </div>
            \`).join('')}
            <label class="bm-upload-btn" title="Upload logo">
              +
              <input type="file" accept="image/*" hidden id="bm-logo-upload" />
            </label>
          </div>
          <div class="bm-status" id="bm-logo-status"></div>
        </div>

        <div class="bm-section">
          <div class="bm-section-title">Backgrounds</div>
          <div class="bm-asset-grid" id="bm-bg-grid">
            \${backgrounds.map(b => \`
              <div class="bm-asset-item bg-thumb" data-bg-name="\${encodeURIComponent(b.name)}" title="\${b.name}">
                <img src="\${b.url}" alt="\${b.name}" />
                <button class="bm-asset-delete" data-delete-bg="\${encodeURIComponent(b.name)}" title="Delete">&times;</button>
              </div>
            \`).join('')}
            <label class="bm-upload-btn" title="Upload background">
              +
              <input type="file" accept="image/*" hidden id="bm-bg-upload" />
            </label>
          </div>
          <div class="bm-status" id="bm-bg-status"></div>
        </div>

        <div class="bm-section">
          <div class="bm-section-title">Watermark</div>
          <div style="display:flex;align-items:center;gap:1rem;">
            <div class="bm-watermark-preview">
              \${wm ? \`<img src="\${wm.url}" alt="watermark" />\` : '<span style="font-size:0.7rem;color:#6a6a7a;">None</span>'}
            </div>
            <label class="bm-upload-btn" style="width:60px;height:60px;" title="Upload watermark">
              +
              <input type="file" accept="image/*" hidden id="bm-wm-upload" />
            </label>
          </div>
          <div class="bm-status" id="bm-wm-status"></div>
        </div>
      \`;
    }

    function bindBmBrandPanel(kit) {
      const brandId = kit.id;

      // Save metadata
      document.getElementById('bm-save-meta').addEventListener('click', async () => {
        const statusEl = document.getElementById('bm-meta-status');
        statusEl.textContent = 'Saving...';
        statusEl.style.color = '#a0a0b0';
        try {
          const body = {
            name: document.getElementById('bm-name').value.trim(),
            fonts: { heading: document.getElementById('bm-font-heading').value.trim(), body: kit.fonts?.body || '' },
            colors: {
              primary: document.getElementById('bm-color-primary').value,
              secondary: document.getElementById('bm-color-secondary').value,
              accent: document.getElementById('bm-color-accent').value,
              text_light: document.getElementById('bm-color-text_light').value,
              text_dark: document.getElementById('bm-color-text_dark').value,
            },
          };
          const res = await fetch(\`/api/brands/\${brandId}\`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
          });
          if (!res.ok) throw new Error('Failed');
          const updated = await res.json();
          // Sync to DATA.brands cache
          DATA.brands[brandId] = updated;
          statusEl.textContent = 'Saved!';
          statusEl.style.color = '#6ac96a';
          await refreshBrandDropdown();
          await renderBmBrandList();
          // Re-mark active brand in sidebar
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch {
          statusEl.textContent = 'Save failed';
          statusEl.style.color = '#f66';
        }
      });

      // Logo upload
      document.getElementById('bm-logo-upload').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = document.getElementById('bm-logo-status');
        statusEl.textContent = 'Uploading...';
        statusEl.style.color = '#a0a0b0';
        try {
          const form = new FormData();
          form.append('file', file);
          form.append('name', file.name.replace(/\.[^.]+$/, ''));
          const res = await fetch(\`/api/brands/\${brandId}/assets/logos\`, { method: 'POST', body: form });
          if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Upload failed'); }
          const kit = await res.json();
          DATA.brands[brandId] = kit;
          statusEl.textContent = 'Uploaded!';
          statusEl.style.color = '#6ac96a';
          // Refresh asset grid
          document.getElementById('bm-logo-grid').outerHTML; // trigger re-render via selectBrandForManage
          await selectBrandForManage(brandId);
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch (err) {
          statusEl.textContent = err.message || 'Upload failed';
          statusEl.style.color = '#f66';
        }
      });

      // Logo delete (delegated)
      document.getElementById('bm-logo-grid').addEventListener('click', async e => {
        const btn = e.target.closest('[data-delete-logo]');
        if (!btn) return;
        const logoId = btn.dataset.deleteLogo;
        if (!confirm(\`Delete logo "\${logoId}"?\`)) return;
        const statusEl = document.getElementById('bm-logo-status');
        statusEl.textContent = 'Deleting...';
        try {
          const res = await fetch(\`/api/brands/\${brandId}/assets/logos/\${logoId}\`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Delete failed');
          const kit = await res.json();
          DATA.brands[brandId] = kit;
          statusEl.textContent = 'Deleted';
          statusEl.style.color = '#6ac96a';
          await selectBrandForManage(brandId);
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch {
          statusEl.textContent = 'Delete failed';
          statusEl.style.color = '#f66';
        }
      });

      // Background upload
      document.getElementById('bm-bg-upload').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = document.getElementById('bm-bg-status');
        statusEl.textContent = 'Uploading...';
        statusEl.style.color = '#a0a0b0';
        try {
          const form = new FormData();
          form.append('file', file);
          form.append('name', file.name.replace(/\.[^.]+$/, ''));
          const res = await fetch(\`/api/brands/\${brandId}/assets/backgrounds\`, { method: 'POST', body: form });
          if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Upload failed'); }
          const kit = await res.json();
          DATA.brands[brandId] = kit;
          statusEl.textContent = 'Uploaded!';
          statusEl.style.color = '#6ac96a';
          await selectBrandForManage(brandId);
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch (err) {
          statusEl.textContent = err.message || 'Upload failed';
          statusEl.style.color = '#f66';
        }
      });

      // Background delete (delegated)
      document.getElementById('bm-bg-grid').addEventListener('click', async e => {
        const btn = e.target.closest('[data-delete-bg]');
        if (!btn) return;
        const bgName = btn.dataset.deleteBg;
        if (!confirm(\`Delete this background?\`)) return;
        const statusEl = document.getElementById('bm-bg-status');
        statusEl.textContent = 'Deleting...';
        try {
          const res = await fetch(\`/api/brands/\${brandId}/assets/backgrounds/\${bgName}\`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Delete failed');
          const kit = await res.json();
          DATA.brands[brandId] = kit;
          statusEl.textContent = 'Deleted';
          statusEl.style.color = '#6ac96a';
          await selectBrandForManage(brandId);
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch {
          statusEl.textContent = 'Delete failed';
          statusEl.style.color = '#f66';
        }
      });

      // Watermark upload
      document.getElementById('bm-wm-upload').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        const statusEl = document.getElementById('bm-wm-status');
        statusEl.textContent = 'Uploading...';
        statusEl.style.color = '#a0a0b0';
        try {
          const form = new FormData();
          form.append('file', file);
          form.append('opacity', 'light');
          const res = await fetch(\`/api/brands/\${brandId}/assets/watermark\`, { method: 'POST', body: form });
          if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Upload failed'); }
          const kit = await res.json();
          DATA.brands[brandId] = kit;
          statusEl.textContent = 'Uploaded!';
          statusEl.style.color = '#6ac96a';
          await selectBrandForManage(brandId);
          document.querySelectorAll('.bm-brand-item').forEach(el => el.classList.toggle('active', el.dataset.id === brandId));
        } catch (err) {
          statusEl.textContent = err.message || 'Upload failed';
          statusEl.style.color = '#f66';
        }
      });
    }

    // Render create new brand form
    function renderBmCreateForm() {
      const main = document.getElementById('bm-main');
      main.innerHTML = \`
        <div class="bm-section">
          <div class="bm-section-title">Create New Brand</div>
          <div class="bm-form-group" style="margin-bottom:0.75rem;">
            <label>Brand Name</label>
            <input type="text" id="bm-new-name" placeholder="My Brand" />
          </div>
          <button class="bm-save-btn" id="bm-create-submit">Create Brand</button>
          <div class="bm-status" id="bm-create-status"></div>
        </div>
      \`;
      document.getElementById('bm-create-submit').addEventListener('click', async () => {
        const name = document.getElementById('bm-new-name').value.trim();
        const statusEl = document.getElementById('bm-create-status');
        if (!name) { statusEl.textContent = 'Name is required'; statusEl.style.color = '#f66'; return; }
        statusEl.textContent = 'Creating...';
        statusEl.style.color = '#a0a0b0';
        try {
          const res = await fetch('/api/brands', {
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }),
          });
          if (!res.ok) { const err = await res.json().catch(()=>({})); throw new Error(err.error || 'Create failed'); }
          const kit = await res.json();
          DATA.brands[kit.id] = kit;
          statusEl.textContent = \`Created "\${kit.name}"\`;
          statusEl.style.color = '#6ac96a';
          await refreshBrandDropdown();
          await renderBmBrandList();
          // Auto-select the new brand in sidebar
          const item = document.querySelector(\`.bm-brand-item[data-id="\${kit.id}"]\`);
          if (item) { item.classList.add('active'); selectBrandForManage(kit.id); }
        } catch (err) {
          statusEl.textContent = err.message || 'Create failed';
          statusEl.style.color = '#f66';
        }
      });
    }

    // ── Init brand manager button ──────────────────────────────────────────────
    document.getElementById('brand-manager-btn').addEventListener('click', openBrandManager);
    document.getElementById('brand-manager-close').addEventListener('click', closeBrandManager);
    document.getElementById('brand-manager-modal').addEventListener('click', e => {
      if (e.target === document.getElementById('brand-manager-modal')) closeBrandManager();
    });

    document.addEventListener('DOMContentLoaded', async () => {
      if (typeof window.snapdom === 'undefined') { document.getElementById('download-btn').disabled = true; }
      document.getElementById('title-input').value = state.title;
      document.getElementById('subtitle-input').value = state.subtitle;
      await document.fonts.ready;
      renderSwatches(state.brand);
      renderBrandBgGrid(state.brand);
      renderGradientPresets();
      bind();
      initUploadZone();
      initTemplateDesigner();
      // Init Phase 2 controls
      renderLogoSelector();
      renderImageSlots();
      // Show/hide watermark control based on initial brand
      const wmCtrl = document.getElementById('watermark-control');
      if (wmCtrl) wmCtrl.style.display = state.brand.watermark ? '' : 'none';

      // Check for ?d= param to load and edit existing design
      const urlParams = new URLSearchParams(window.location.search);
      const designId = urlParams.get('d');
      if (designId) {
        try {
          const res = await fetch(\`/api/designs/\${encodeURIComponent(designId)}\`);
          if (res.ok) {
            const design = await res.json();
            currentDesignId = design.id;
            hydrateFromDesign(design);
          } else {
            render();
          }
        } catch (e) {
          console.error('Failed to load design:', e);
          render();
        }
      } else {
        render();
      }
    });

    // ── Template Designer ─────────────────────────────────────────────────────

    // Track which custom layout is being edited (null = creating new)
    let tdEditingId = null;

    // Sample data used for live preview substitution
    const TD_SAMPLE = {
      width: 1200, height: 630,
      title: 'Sample Title', subtitle: 'Sample Subtitle',
      bg_color: '#1a1a3e', title_color: '#FFD700', subtitle_color: '#FFFFFF',
      logo: '', feature_image: '', overlay: 'none',
      image_1: '', image_2: '',
    };

    function tdRenderPreview() {
      const html = document.getElementById('td-html').value;
      const css = document.getElementById('td-css').value;
      let rendered = html.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
        const val = TD_SAMPLE[key];
        return val !== undefined ? String(val) : '';
      });
      const frame = document.getElementById('td-preview-frame');
      frame.innerHTML = \`<style>\${css}</style>\${rendered}\`;

      // Scale preview to fit the panel
      const thumb = frame.querySelector('#thumbnail');
      if (thumb) {
        const wrapper = document.getElementById('td-preview-frame').parentElement;
        const maxW = wrapper.clientWidth - 32;
        const maxH = wrapper.clientHeight - 32;
        const tw = TD_SAMPLE.width, th = TD_SAMPLE.height;
        const scale = Math.min(maxW / tw, maxH / th, 1);
        thumb.style.transform = \`scale(\${scale})\`;
        thumb.style.transformOrigin = 'top left';
        frame.style.width = \`\${tw * scale}px\`;
        frame.style.height = \`\${th * scale}px\`;
      }
    }

    const debouncedTdPreview = debounce(tdRenderPreview, 300);

    function tdGetCategories() {
      return Array.from(document.querySelectorAll('#td-categories input:checked')).map(el => el.value);
    }

    function tdGetParams() {
      const rows = document.querySelectorAll('#td-params-list .td-param-row');
      return Array.from(rows).map(row => ({
        key: row.querySelector('[data-field="key"]').value.trim(),
        label: row.querySelector('[data-field="label"]').value.trim(),
        type: row.querySelector('[data-field="type"]').value,
      })).filter(p => p.key);
    }

    function tdAddParamRow(param = { key: '', label: '', type: 'text' }) {
      const list = document.getElementById('td-params-list');
      const row = document.createElement('div');
      row.className = 'td-param-row';
      row.innerHTML = \`
        <input data-field="key" placeholder="key" value="\${esc(param.key)}" title="Param key (used in {{key}})" />
        <select data-field="type">
          \${['text','color','image','select'].map(t => \`<option value="\${t}" \${t === param.type ? 'selected' : ''}>\${t}</option>\`).join('')}
        </select>
        <button class="td-param-remove" title="Remove">&times;</button>
      \`;
      row.querySelector('.td-param-remove').addEventListener('click', () => row.remove());
      list.appendChild(row);
    }

    function tdResetForm() {
      tdEditingId = null;
      document.getElementById('td-name').value = '';
      document.getElementById('td-id').value = '';
      document.getElementById('td-html').value = '';
      document.getElementById('td-css').value = '';
      document.getElementById('td-params-list').innerHTML = '';
      document.getElementById('td-status').textContent = '';
      // Reset categories: landscape checked, others unchecked
      document.querySelectorAll('#td-categories input').forEach(cb => {
        cb.checked = cb.value === 'landscape';
      });
      document.getElementById('td-preview-frame').innerHTML = '';
    }

    async function openTemplateDesigner(layoutId = null) {
      tdResetForm();
      if (layoutId) {
        // Load existing custom layout for editing
        try {
          const res = await fetch(\`/api/layouts/\${layoutId}\`);
          if (res.ok) {
            const data = await res.json();
            if (data.custom !== false) {
              // Only populate form if it's a custom layout (has html field)
              tdEditingId = data.id;
              document.getElementById('td-name').value = data.name || '';
              document.getElementById('td-id').value = data.id || '';
              document.getElementById('td-html').value = data.html || '';
              document.getElementById('td-css').value = data.css || '';
              document.querySelectorAll('#td-categories input').forEach(cb => {
                cb.checked = (data.categories || []).includes(cb.value);
              });
              (data.params || []).forEach(p => tdAddParamRow(p));
              setTimeout(tdRenderPreview, 50);
            }
          }
        } catch (e) {
          console.error('Failed to load layout for editing:', e);
        }
      }
      document.getElementById('template-designer-modal').classList.remove('hidden');
    }

    function closeTemplateDesigner() {
      document.getElementById('template-designer-modal').classList.add('hidden');
    }

    async function saveTdLayout() {
      const statusEl = document.getElementById('td-status');
      const name = document.getElementById('td-name').value.trim();
      const idVal = document.getElementById('td-id').value.trim();
      const html = document.getElementById('td-html').value.trim();
      const css = document.getElementById('td-css').value.trim();
      const categories = tdGetCategories();
      const params = tdGetParams();

      if (!name) { statusEl.textContent = 'Layout name is required'; statusEl.style.color = '#f66'; return; }
      if (!html) { statusEl.textContent = 'HTML template is required'; statusEl.style.color = '#f66'; return; }
      if (!html.includes('id="thumbnail"')) { statusEl.textContent = 'HTML must contain id="thumbnail"'; statusEl.style.color = '#f66'; return; }
      if (categories.length === 0) { statusEl.textContent = 'Select at least one category'; statusEl.style.color = '#f66'; return; }

      const body = { name, html, css, categories, params };
      if (idVal) body.id = idVal;

      statusEl.textContent = tdEditingId ? 'Updating...' : 'Saving...';
      statusEl.style.color = '#a0a0b0';

      try {
        const url = tdEditingId ? \`/api/layouts/\${tdEditingId}\` : '/api/layouts';
        const method = tdEditingId ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.error || 'Save failed');

        tdEditingId = result.id;
        document.getElementById('td-id').value = result.id;
        statusEl.textContent = \`Saved as "\${result.name}"\`;
        statusEl.style.color = '#6ac96a';

        // Refresh layout dropdown to include new/updated custom layout
        await refreshLayoutDropdown();
      } catch (err) {
        statusEl.textContent = err.message || 'Save failed';
        statusEl.style.color = '#f66';
      }
    }

    async function refreshLayoutDropdown() {
      try {
        const res = await fetch('/api/layouts');
        const layouts = await res.json();
        const select = document.getElementById('layout-select');
        const currentVal = select.value;
        select.innerHTML = layouts.map(l =>
          \`<option value="\${l.id}">\${esc(l.name)}\${l.custom ? ' (custom)' : ''}</option>\`
        ).join('');
        // Restore selection
        const exists = layouts.find(l => l.id === currentVal);
        if (exists) select.value = currentVal;

        // Update DATA.layouts cache with custom layouts
        layouts.forEach(l => {
          if (!DATA.layouts[l.id]) DATA.layouts[l.id] = l;
        });
      } catch (e) {
        console.error('refreshLayoutDropdown failed:', e);
      }
    }

    // Fetch custom layout data and register a client-side renderer for it
    async function fetchCustomRenderer(layoutId) {
      try {
        const res = await fetch(\`/api/layouts/\${layoutId}\`);
        if (!res.ok) return null;
        const data = await res.json();
        if (!data.html) return null;
        RENDERERS[layoutId] = (p) => {
          let html = data.html.replace(/\\{\\{(\\w+)\\}\\}/g, (_, key) => {
            const val = p[key];
            return val !== undefined ? esc(String(val)) : '';
          });
          return data.css ? \`<style>\${data.css}</style>\${html}\` : html;
        };
        return RENDERERS[layoutId];
      } catch {
        return null;
      }
    }

    function initTemplateDesigner() {
      // Tab switching
      document.querySelectorAll('.td-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.td-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          const active = tab.dataset.tab;
          document.getElementById('td-html').classList.toggle('hidden', active !== 'html');
          document.getElementById('td-css').classList.toggle('hidden', active !== 'css');
        });
      });

      // Live preview on input
      document.getElementById('td-html').addEventListener('input', debouncedTdPreview);
      document.getElementById('td-css').addEventListener('input', debouncedTdPreview);

      // Add param
      document.getElementById('td-add-param').addEventListener('click', () => tdAddParamRow());

      // Save
      document.getElementById('td-save').addEventListener('click', saveTdLayout);

      // Close modal
      document.getElementById('td-close').addEventListener('click', closeTemplateDesigner);
      document.getElementById('template-designer-modal').addEventListener('click', e => {
        if (e.target === document.getElementById('template-designer-modal')) closeTemplateDesigner();
      });

      // "Design Template" button: open designer for current layout if custom, else blank
      document.getElementById('design-template-btn').addEventListener('click', async () => {
        const currentLayout = state.layout;
        const layoutData = DATA.layouts[currentLayout];
        // Only pre-load if it's a known custom layout
        if (layoutData && layoutData.custom) {
          await openTemplateDesigner(currentLayout);
        } else {
          await openTemplateDesigner(null);
        }
      });

    }
  `;
}
