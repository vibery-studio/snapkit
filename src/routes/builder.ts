// Builder UI route - serves the interactive thumbnail builder
import { htmlResponse } from '../lib/response-helpers';
import { SIZE_PRESETS } from '../data/size-presets';
import { BRANDS, BRAND_IDS } from '../data/brand-kits';
import { LAYOUTS, LAYOUT_IDS } from '../layouts';

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
      <select id="brand-select" class="brand-select">
        ${brandOptions}
      </select>
    </header>
    <main class="app-main">
      <aside class="controls">
        <div class="control-group">
          <label for="size-select">Size Preset</label>
          <select id="size-select">
            ${sizeOptions}
          </select>
        </div>
        <div class="control-group">
          <label for="layout-select">Layout</label>
          <select id="layout-select">
            ${layoutOptions}
          </select>
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
            <button class="bg-tab active" data-tab="color">Color</button>
            <button class="bg-tab" data-tab="image">Image</button>
          </div>
          <div class="bg-panel" id="bg-color-panel">
            <input type="color" id="bg-color" value="#1a1a3e" />
            <div class="color-swatches" id="bg-swatches"></div>
          </div>
          <div class="bg-panel hidden" id="bg-image-panel">
            <input type="text" id="bg-image-url" placeholder="Image URL or search..." />
            <button id="bg-search-btn" class="btn-secondary">Search</button>
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
        <div class="control-group checkbox-group">
          <label><input type="checkbox" id="logo-toggle" checked /> Show Logo</label>
        </div>
        <div class="button-group">
          <button id="download-btn" class="btn-primary">Download PNG</button>
          <button id="save-btn" class="btn-secondary">Save Design</button>
        </div>
      </aside>
      <section class="preview">
        <div class="preview-frame" id="preview-frame"></div>
        <div class="preview-info" id="preview-info">1200 × 630</div>
      </section>
    </main>
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
    .brand-select { background: #1a1a3e; color: #FFD700; border: 1px solid #3a3a5a; padding: 0.5rem 1rem; border-radius: 6px; font-weight: 600; }
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
    .bg-tabs { display: flex; gap: 0.5rem; margin-bottom: 0.75rem; }
    .bg-tab { flex: 1; padding: 0.5rem; background: #0f0f1a; border: 1px solid #3a3a5a; border-radius: 6px; color: #a0a0b0; cursor: pointer; font-size: 0.85rem; }
    .bg-tab.active { background: #2a2a4a; color: #FFD700; border-color: #FFD700; }
    .bg-panel { display: flex; gap: 0.5rem; flex-wrap: wrap; }
    .bg-panel.hidden { display: none; }
    .color-swatches { display: flex; gap: 0.25rem; margin-top: 0.5rem; flex-wrap: wrap; }
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
  </style>`;
}

function clientScript(data: object): string {
  return `
    const DATA = ${JSON.stringify(data)};

    // Layout render functions (must match server-side)
    const esc = s => s ? s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])) : '';
    const safeColor = (c, fallback) => (c && /^#[0-9a-fA-F]{3,8}$|^rgb/.test(c)) ? c : fallback;
    const logoHtml = (p, pos) => p.logo ? \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${pos};height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />\` : '';

    const RENDERERS = {
      'overlay-center': (p) => {
        const overlay = { none: '', light: 'linear-gradient(rgba(0,0,0,0.2),rgba(0,0,0,0.2)),', medium: 'linear-gradient(rgba(0,0,0,0.4),rgba(0,0,0,0.4)),', dark: 'linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),' }[p.overlay || 'none'] || '';
        const bgStyle = p.bg_image ? \`background:\${overlay}url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${safeColor(p.bg_color,'#1a1a3e')}\`;
        const titleColor = safeColor(p.title_color, '#FFD700');
        const subColor = safeColor(p.subtitle_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">\${esc(p.title)}</h1>\${sub}</div>\`;
      },
      'split-left': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;right:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'split-right': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const accentColor = safeColor(p.accent_color, '#FFD700');
        const sub = p.subtitle ? \`<p style="color:\${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;background:\${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%')}<div style="width:3em;height:4px;background:\${accentColor};margin-bottom:1em;border-radius:2px;"></div><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div></div>\`;
      },
      'overlay-bottom': (p) => {
        const fallbackBg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const barColor = safeColor(p.bar_color, '#000000');
        const bgStyle = p.bg_image ? \`background:url('\${p.bg_image}') center/cover no-repeat\` : \`background:\${fallbackBg}\`;
        const sub = p.subtitle ? \`<p style="position:relative;color:\${titleColor};font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="position:absolute;bottom:0;left:0;right:0;height:30%;padding:0 6%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;"><div style="position:absolute;inset:0;background:\${barColor};opacity:0.88;"></div><h1 style="position:relative;color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'card-center': (p) => {
        const bg = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const sub = p.subtitle ? \`<p style="color:\${titleColor};font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;"><div style="width:100%;height:60%;position:relative;flex-shrink:0;overflow:hidden;"><img src="\${p.feature_image||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:100%;height:40%;background:\${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6% 8%;box-sizing:border-box;position:relative;">\${logoHtml(p,'top:5%;left:5%;height:12%;max-width:35%')}<h1 style="color:\${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;">\${esc(p.title)}</h1>\${sub}</div></div>\`;
      },
      'text-only': (p) => {
        const bgStart = safeColor(p.bg_color, '#1a1a3e');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        const subColor = safeColor(p.subtitle_color, '#FFD700');
        const bgStyle = p.gradient_end ? \`background:linear-gradient(135deg,\${bgStart} 0%,\${safeColor(p.gradient_end,bgStart)} 100%)\` : \`background:\${bgStart}\`;
        const sub = p.subtitle ? \`<p style="color:\${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${esc(p.subtitle)}</p>\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;\${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">\${logoHtml(p,'bottom:5%;right:5%')}<h1 style="color:\${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;">\${esc(p.title)}</h1>\${sub}</div>\`;
      },
      'collage-2': (p) => {
        const bg = safeColor(p.bg_color, '#111111');
        const titleColor = safeColor(p.title_color, '#FFFFFF');
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;background:\${bg};display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">\${logoHtml(p,'top:5%;right:5%;z-index:2')}<div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%;padding:3% 5%;box-sizing:border-box;overflow:hidden;"><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_1||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div><div style="width:46%;height:100%;overflow:hidden;border-radius:4px;"><img src="\${p.image_2||''}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /></div></div><div style="height:22%;display:flex;align-items:center;justify-content:center;padding:0 6%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);"><h1 style="color:\${titleColor};font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;">\${esc(p.title)}</h1></div></div>\`;
      },
      'frame': (p) => {
        const frameColor = safeColor(p.frame_color, '#FFD700');
        const inset = Math.round(Math.min(p.width, p.height) * 0.03);
        const posMap = { 'top-left':'top:calc(3% + 1em);left:calc(3% + 1em)', 'top-right':'top:calc(3% + 1em);right:calc(3% + 1em)', 'bottom-left':'bottom:calc(3% + 1em);left:calc(3% + 1em)', 'bottom-right':'bottom:calc(3% + 1em);right:calc(3% + 1em)' };
        const logoPos = posMap[p.logo_position] || posMap['bottom-right'];
        const logo = p.logo ? \`<img src="\${p.logo}" alt="logo" style="position:absolute;\${logoPos};height:8%;max-width:25%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />\` : '';
        return \`<div id="thumbnail" style="width:\${p.width}px;height:\${p.height}px;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:#000;"><img src="\${p.feature_image||''}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" /><div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 \${inset}px \${frameColor};z-index:2;"></div>\${logo}</div>\`;
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
      showLogo: true,
    };

    function render() {
      const renderer = RENDERERS[state.layout];
      if (!renderer) return;
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
        logo: state.showLogo && state.brand.logos[0] ? state.brand.logos[0].url : null,
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
      document.getElementById('bg-color').value = brand.colors.primary;
      document.getElementById('title-color').value = brand.colors.secondary;
      document.getElementById('sub-color').value = brand.colors.text_light;
      renderSwatches(brand);
      render();
    }

    function renderSwatches(brand) {
      const container = document.getElementById('bg-swatches');
      container.innerHTML = Object.values(brand.colors).map(c => \`<div class="color-swatch" style="background:\${c}" data-color="\${c}"></div>\`).join('');
      container.querySelectorAll('.color-swatch').forEach(el => {
        el.addEventListener('click', () => { state.bg_color = el.dataset.color; document.getElementById('bg-color').value = el.dataset.color; render(); });
      });
    }

    function debounce(fn, ms = 100) { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; }

    function bind() {
      document.getElementById('size-select').addEventListener('change', e => { state.size = DATA.sizes.find(s => s.id === e.target.value); render(); });
      document.getElementById('layout-select').addEventListener('change', e => { state.layout = e.target.value; render(); });
      document.getElementById('brand-select').addEventListener('change', e => { applyBrand(DATA.brands[e.target.value]); });
      document.getElementById('title-input').addEventListener('input', debounce(e => { state.title = e.target.value; render(); }));
      document.getElementById('subtitle-input').addEventListener('input', debounce(e => { state.subtitle = e.target.value; render(); }));
      document.getElementById('bg-color').addEventListener('input', e => { state.bg_color = e.target.value; state.bg_image = ''; render(); });
      document.getElementById('title-color').addEventListener('input', e => { state.title_color = e.target.value; render(); });
      document.getElementById('sub-color').addEventListener('input', e => { state.subtitle_color = e.target.value; render(); });
      document.getElementById('overlay-select').addEventListener('change', e => { state.overlay = e.target.value; render(); });
      document.getElementById('logo-toggle').addEventListener('change', e => { state.showLogo = e.target.checked; render(); });
      document.getElementById('bg-image-url').addEventListener('input', debounce(e => { if (e.target.value) { state.bg_image = e.target.value; render(); } }));
      document.querySelectorAll('.bg-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          document.querySelectorAll('.bg-tab').forEach(t => t.classList.remove('active'));
          tab.classList.add('active');
          document.getElementById('bg-color-panel').classList.toggle('hidden', tab.dataset.tab !== 'color');
          document.getElementById('bg-image-panel').classList.toggle('hidden', tab.dataset.tab !== 'image');
        });
      });
      window.addEventListener('resize', debounce(updateScale, 150));
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

    async function saveDesign() {
      const btn = document.getElementById('save-btn');
      btn.disabled = true; btn.textContent = 'Saving...';
      try {
        const design = { size: { preset: state.size.id, width: state.size.w, height: state.size.h }, layout: state.layout, brand: state.brand.id, params: { title: state.title, subtitle: state.subtitle, bg_color: state.bg_color, bg_image: state.bg_image, title_color: state.title_color, subtitle_color: state.subtitle_color, overlay: state.overlay, showLogo: state.showLogo } };
        const res = await fetch('/api/designs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(design) });
        if (!res.ok) throw new Error('Save failed');
        const { id } = await res.json();
        const shareUrl = \`\${location.origin}/d/\${id}\`;
        await navigator.clipboard.writeText(shareUrl);
        btn.textContent = 'Copied URL!'; setTimeout(() => { btn.textContent = 'Save Design'; }, 2000);
      } catch (e) { console.error(e); btn.textContent = 'Error'; setTimeout(() => { btn.textContent = 'Save Design'; }, 2000); }
      finally { btn.disabled = false; }
    }

    document.getElementById('download-btn').addEventListener('click', downloadPNG);
    document.getElementById('save-btn').addEventListener('click', saveDesign);

    document.addEventListener('DOMContentLoaded', async () => {
      if (typeof window.snapdom === 'undefined') { document.getElementById('download-btn').disabled = true; }
      document.getElementById('title-input').value = state.title;
      document.getElementById('subtitle-input').value = state.subtitle;
      await document.fonts.ready;
      renderSwatches(state.brand);
      bind();
      render();
    });
  `;
}
