// SnapKit - Multi-Brand Thumbnail Generator
// Cloudflare Worker entry point

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Root path serves builder UI
    if (url.pathname === '/' || url.pathname === '') {
      return new Response(builderHTML(), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      });
    }

    // 404 for unmatched routes (static assets handled by wrangler)
    return new Response('Not found', { status: 404 });
  }
};

function builderHTML() {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SnapKit - Thumbnail Builder</title>
  <script src="https://unpkg.com/@zumer/snapdom@2.0.2/dist/snapdom.js"></script>
  <style>
    /* Font faces */
    @font-face {
      font-family: 'Montserrat';
      src: url('/fonts/Montserrat-Bold.woff2') format('woff2');
      font-weight: 700;
      font-display: swap;
    }
    @font-face {
      font-family: 'Montserrat';
      src: url('/fonts/Montserrat-ExtraBold.woff2') format('woff2');
      font-weight: 800;
      font-display: swap;
    }
    @font-face {
      font-family: 'Be Vietnam Pro';
      src: url('/fonts/BeVietnamPro-Regular.woff2') format('woff2');
      font-weight: 400;
      font-display: swap;
    }
    @font-face {
      font-family: 'Be Vietnam Pro';
      src: url('/fonts/BeVietnamPro-SemiBold.woff2') format('woff2');
      font-weight: 600;
      font-display: swap;
    }

    /* Reset & base */
    *, *::before, *::after { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, sans-serif;
      background: #0f0f1a;
      color: #e0e0e0;
      min-height: 100vh;
    }

    /* App layout */
    .app {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
    }
    .app-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 1.5rem;
      background: #1a1a2e;
      border-bottom: 1px solid #2a2a4a;
    }
    .app-header h1 {
      margin: 0;
      font-family: 'Montserrat', sans-serif;
      font-weight: 800;
      font-size: 1.5rem;
      color: #FFD700;
    }
    .brand-badge {
      background: #1a1a3e;
      color: #FFD700;
      padding: 0.25rem 0.75rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.85rem;
    }

    .app-main {
      display: grid;
      grid-template-columns: 320px 1fr;
      flex: 1;
    }

    /* Controls panel */
    .controls {
      background: #1a1a2e;
      padding: 1.5rem;
      overflow-y: auto;
      border-right: 1px solid #2a2a4a;
    }
    .control-group {
      margin-bottom: 1.25rem;
    }
    .control-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      font-size: 0.85rem;
      color: #a0a0b0;
    }
    .control-group input[type="text"],
    .control-group select {
      width: 100%;
      padding: 0.625rem 0.75rem;
      background: #0f0f1a;
      border: 1px solid #3a3a5a;
      border-radius: 6px;
      color: #e0e0e0;
      font-family: inherit;
      font-size: 0.95rem;
    }
    .control-group input[type="text"]:focus,
    .control-group select:focus {
      outline: none;
      border-color: #FFD700;
    }
    .control-group input[type="text"]::placeholder {
      color: #6a6a7a;
    }

    .control-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
      margin-bottom: 1.25rem;
    }
    .control-row .control-group {
      margin-bottom: 0;
    }
    .control-group input[type="color"] {
      width: 100%;
      height: 40px;
      padding: 2px;
      background: #0f0f1a;
      border: 1px solid #3a3a5a;
      border-radius: 6px;
      cursor: pointer;
    }

    .control-group.checkbox-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
      color: #e0e0e0;
    }
    .control-group.checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #FFD700;
    }

    .btn-primary {
      width: 100%;
      padding: 0.875rem 1rem;
      background: linear-gradient(135deg, #FFD700, #FF6B35);
      border: none;
      border-radius: 8px;
      color: #1a1a3e;
      font-family: 'Montserrat', sans-serif;
      font-weight: 700;
      font-size: 1rem;
      cursor: pointer;
      transition: transform 0.15s, box-shadow 0.15s;
    }
    .btn-primary:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
    }
    .btn-primary:active {
      transform: translateY(0);
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    /* Preview panel */
    .preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      background: #12121f;
      position: relative;
    }
    .preview-frame {
      display: flex;
      align-items: flex-start;
      justify-content: center;
      max-width: 100%;
      max-height: calc(100vh - 180px);
      overflow: hidden;
      border-radius: 8px;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    }
    .preview-info {
      margin-top: 1rem;
      color: #6a6a7a;
      font-size: 0.85rem;
      font-weight: 600;
    }

    /* Responsive: mobile */
    @media (max-width: 768px) {
      .app-main {
        grid-template-columns: 1fr;
      }
      .controls {
        border-right: none;
        border-bottom: 1px solid #2a2a4a;
        max-height: 40vh;
      }
      .control-row {
        grid-template-columns: repeat(2, 1fr);
      }
      .preview {
        padding: 1rem;
      }
    }

    /* Loading state */
    .loading .btn-primary::after {
      content: '...';
    }
  </style>
</head>
<body>
  <div class="app">
    <header class="app-header">
      <h1>SnapKit</h1>
      <span class="brand-badge">GOHA</span>
    </header>
    <main class="app-main">
      <aside class="controls">
        <div class="control-group">
          <label for="size-select">Size Preset</label>
          <select id="size-select">
            <option value="fb-post">Facebook Post (1200×630)</option>
            <option value="ig-post">Instagram Post (1080×1080)</option>
            <option value="yt-thumbnail">YouTube Thumbnail (1280×720)</option>
          </select>
        </div>
        <div class="control-group">
          <label for="title-input">Title</label>
          <input type="text" id="title-input" placeholder="Nhập tiêu đề..." value="Tối ưu content B2B cho AI" maxlength="100" />
        </div>
        <div class="control-group">
          <label for="subtitle-input">Subtitle</label>
          <input type="text" id="subtitle-input" placeholder="Nhập phụ đề..." value="Cuộc cách mạng tìm kiếm đa bước" maxlength="150" />
        </div>
        <div class="control-row">
          <div class="control-group">
            <label for="bg-color">Background</label>
            <input type="color" id="bg-color" value="#1a1a3e" />
          </div>
          <div class="control-group">
            <label for="title-color">Title Color</label>
            <input type="color" id="title-color" value="#FFD700" />
          </div>
          <div class="control-group">
            <label for="sub-color">Subtitle Color</label>
            <input type="color" id="sub-color" value="#FFFFFF" />
          </div>
        </div>
        <div class="control-group checkbox-group">
          <label>
            <input type="checkbox" id="logo-toggle" checked />
            Show Logo
          </label>
        </div>
        <button id="download-btn" class="btn-primary">Download PNG</button>
      </aside>
      <section class="preview">
        <div class="preview-frame" id="preview-frame"></div>
        <div class="preview-info" id="preview-info">1200 × 630</div>
      </section>
    </main>
  </div>

  <script type="module">
    // === DATA ===
    const SIZE_PRESETS = [
      { id: 'fb-post', name: 'Facebook Post', w: 1200, h: 630, category: 'landscape' },
      { id: 'ig-post', name: 'Instagram Post', w: 1080, h: 1080, category: 'square' },
      { id: 'yt-thumbnail', name: 'YouTube Thumbnail', w: 1280, h: 720, category: 'landscape' },
    ];

    const BRAND = {
      id: 'goha',
      name: 'GOHA',
      colors: {
        primary: '#1a1a3e',
        secondary: '#FFD700',
        accent: '#FF6B35',
        text_light: '#FFFFFF',
        text_dark: '#1a1a3e',
      },
      logo: '/brands/goha/logos/goha-white.svg',
    };

    // === UTILITIES ===
    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
      })[c]);
    }

    function isValidColor(color) {
      return /^#[0-9A-Fa-f]{6}$/.test(color);
    }

    function sanitizeColor(color, fallback = '#000000') {
      return isValidColor(color) ? color : fallback;
    }

    // === LAYOUT RENDER ===
    function renderThumbnail({ width, height, title, subtitle, bg_color, title_color, subtitle_color, logo }) {
      const safeBg = sanitizeColor(bg_color, '#1a1a3e');
      const safeTitleColor = sanitizeColor(title_color, '#FFD700');
      const safeSubColor = sanitizeColor(subtitle_color, '#FFFFFF');
      const safeTitle = escapeHtml(title);
      const safeSubtitle = escapeHtml(subtitle);

      const logoHtml = logo
        ? \`<img src="\${logo}" alt="logo" style="position:absolute;top:5%;right:5%;height:8%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />\`
        : '';
      const subtitleHtml = safeSubtitle
        ? \`<p style="color:\${safeSubColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">\${safeSubtitle}</p>\`
        : '';

      return \`<div id="thumbnail" style="width:\${width}px;height:\${height}px;background:\${safeBg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  \${logoHtml}
  <h1 style="color:\${safeTitleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">\${safeTitle}</h1>
  \${subtitleHtml}
</div>\`;
    }

    // === STATE ===
    const state = {
      size: SIZE_PRESETS[0],
      title: 'Tối ưu content B2B cho AI',
      subtitle: 'Cuộc cách mạng tìm kiếm đa bước',
      bg_color: BRAND.colors.primary,
      title_color: BRAND.colors.secondary,
      subtitle_color: BRAND.colors.text_light,
      showLogo: true,
    };

    // === RENDER ===
    function render() {
      const html = renderThumbnail({
        width: state.size.w,
        height: state.size.h,
        title: state.title,
        subtitle: state.subtitle,
        bg_color: state.bg_color,
        title_color: state.title_color,
        subtitle_color: state.subtitle_color,
        logo: state.showLogo ? BRAND.logo : null,
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

    // === CONTROLS ===
    function debounce(fn, ms = 100) {
      let timeout;
      return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), ms);
      };
    }

    function bindControls() {
      // Size preset
      document.getElementById('size-select').addEventListener('change', (e) => {
        state.size = SIZE_PRESETS.find(s => s.id === e.target.value) || SIZE_PRESETS[0];
        render();
      });

      // Title
      const handleTitleChange = debounce((e) => {
        state.title = e.target.value;
        render();
      });
      document.getElementById('title-input').addEventListener('input', handleTitleChange);

      // Subtitle
      const handleSubtitleChange = debounce((e) => {
        state.subtitle = e.target.value;
        render();
      });
      document.getElementById('subtitle-input').addEventListener('input', handleSubtitleChange);

      // Colors (no debounce needed for color picker)
      document.getElementById('bg-color').addEventListener('input', (e) => {
        state.bg_color = e.target.value;
        render();
      });
      document.getElementById('title-color').addEventListener('input', (e) => {
        state.title_color = e.target.value;
        render();
      });
      document.getElementById('sub-color').addEventListener('input', (e) => {
        state.subtitle_color = e.target.value;
        render();
      });

      // Logo toggle
      document.getElementById('logo-toggle').addEventListener('change', (e) => {
        state.showLogo = e.target.checked;
        render();
      });

      // Window resize
      window.addEventListener('resize', debounce(updateScale, 150));
    }

    // === EXPORT ===
    async function downloadPNG() {
      const btn = document.getElementById('download-btn');
      btn.disabled = true;
      btn.textContent = 'Capturing...';

      try {
        await document.fonts.ready;

        const thumb = document.getElementById('thumbnail');
        if (!thumb) throw new Error('Thumbnail not found');

        // Reset transform before capture (scale is for preview only)
        const originalTransform = thumb.style.transform;
        const originalOrigin = thumb.style.transformOrigin;
        thumb.style.transform = 'none';
        thumb.style.transformOrigin = '';

        // Capture at 2x for retina
        const result = await window.snapdom(thumb);
        const blob = await result.toBlob({ type: 'image/png', scale: 2 });

        // Restore preview transform
        thumb.style.transform = originalTransform;
        thumb.style.transformOrigin = originalOrigin;

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = \`snapkit-\${state.size.id}-\${Date.now()}.png\`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        btn.textContent = 'Downloaded!';
        setTimeout(() => { btn.textContent = 'Download PNG'; }, 2000);
      } catch (err) {
        console.error('Capture failed:', err);
        btn.textContent = 'Error - Try Again';
        setTimeout(() => { btn.textContent = 'Download PNG'; }, 3000);
      } finally {
        btn.disabled = false;
      }
    }

    document.getElementById('download-btn').addEventListener('click', downloadPNG);

    // === INIT ===
    document.addEventListener('DOMContentLoaded', async () => {
      // Check snapdom availability
      if (typeof window.snapdom === 'undefined') {
        const btn = document.getElementById('download-btn');
        btn.disabled = true;
        btn.title = 'Export library failed to load. Refresh to retry.';
        btn.textContent = 'Export Unavailable';
      }

      await document.fonts.ready;
      render();
      bindControls();
    });
  </script>
</body>
</html>`;
}
