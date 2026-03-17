// Renders a Design into a complete standalone HTML page for screenshot capture
import type { Design, Env } from './types';
import { resolveLayout, resolveLayoutAsync } from '../layouts';
import { getBrandById } from '../data/brand-kits';
import { getSizeById } from '../data/size-presets';

// Full page shell wrapping the layout's #thumbnail output
function pageShell(thumbnailHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=TikTok+Sans:wght@400;600;700&display=block" />
  <style>
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-Bold.woff2') format('woff2'); font-weight: 700; font-display: block; }
    @font-face { font-family: 'Montserrat'; src: url('/fonts/Montserrat-ExtraBold.woff2') format('woff2'); font-weight: 800; font-display: block; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-Regular.woff2') format('woff2'); font-weight: 400; font-display: block; }
    @font-face { font-family: 'Be Vietnam Pro'; src: url('/fonts/BeVietnamPro-SemiBold.woff2') format('woff2'); font-weight: 600; font-display: block; }
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: #000; }
  </style>
</head>
<body>
  ${thumbnailHtml}
  <script>
    // Wait for all images to load before signaling ready
    (function() {
      var images = document.querySelectorAll('img');
      var bgImages = [];
      // Extract background-image URLs
      document.querySelectorAll('[style*="background-image"]').forEach(function(el) {
        var match = el.style.backgroundImage.match(/url\\(["']?([^"')]+)["']?\\)/);
        if (match && match[1]) bgImages.push(match[1]);
      });

      var pending = images.length + bgImages.length;
      if (pending === 0) { document.body.classList.add('ready'); return; }

      function done() { if (--pending <= 0) document.body.classList.add('ready'); }

      images.forEach(function(img) {
        if (img.complete) done();
        else { img.onload = done; img.onerror = done; }
      });

      bgImages.forEach(function(src) {
        var img = new Image();
        img.onload = done;
        img.onerror = done;
        img.src = src;
      });

      // Fallback: mark ready after 5s max
      setTimeout(function() { document.body.classList.add('ready'); }, 5000);
    })();
  </script>
</body>
</html>`;
}

// Render a saved design object into a full HTML page string
export async function renderDesignToHTML(design: Design, env?: Env): Promise<string> {
  let layout = resolveLayout(design.layout);
  if (!layout && env) {
    layout = await resolveLayoutAsync(design.layout, env);
  }
  if (!layout) throw new Error(`Unknown layout: ${design.layout}`);

  const preset = getSizeById(design.size.preset);
  const width = preset?.w ?? design.size.width;
  const height = preset?.h ?? design.size.height;

  const brand = design.brand ? getBrandById(design.brand) : undefined;
  const params = design.params as Record<string, string>;
  const bg_color = params.bg_color || brand?.colors.primary;
  const title_color = params.title_color || brand?.colors.secondary;
  const subtitle_color = params.subtitle_color || brand?.colors.text_light;

  const hideLogo = params.showLogo === 'false' || params.showLogo === '0';
  const logo = !hideLogo && brand?.logos[0]?.url ? brand.logos[0].url : (params.logo || undefined);

  const thumbnailHtml = layout.render({
    ...params,
    width,
    height,
    title: params.title,
    subtitle: params.subtitle,
    bg_color,
    bg_image: params.bg_image,
    title_color,
    subtitle_color,
    overlay: params.overlay as 'none' | 'light' | 'medium' | 'dark',
    logo,
    feature_image: params.feature_image,
  } as any);

  return pageShell(thumbnailHtml);
}

// Render from inline query params (async to support D1 custom layouts)
export async function renderInlineToHTML(
  layoutId: string,
  sizeId: string,
  params: Record<string, string>,
  env?: Env
): Promise<string> {
  // Try built-in first, then D1 if env provided
  let layout = resolveLayout(layoutId);
  if (!layout && env) {
    layout = await resolveLayoutAsync(layoutId, env);
  }
  if (!layout) throw new Error(`Unknown layout: ${layoutId}`);

  let width: number, height: number;
  if (sizeId === 'custom' && params.width && params.height) {
    width = parseInt(params.width, 10) || 1200;
    height = parseInt(params.height, 10) || 630;
  } else {
    const preset = getSizeById(sizeId);
    if (!preset) throw new Error(`Unknown size preset: ${sizeId}`);
    width = preset.w;
    height = preset.h;
  }

  // Apply brand defaults if brand specified and param not already set
  const brand = params.brand ? getBrandById(params.brand) : undefined;
  const bg_color = params.bg_color || brand?.colors.primary;
  const title_color = params.title_color || brand?.colors.secondary;
  const subtitle_color = params.subtitle_color || brand?.colors.text_light;
  const logo = params.logo || (brand?.logos[0]?.url ? brand.logos[0].url : undefined);

  const thumbnailHtml = layout.render({
    ...params,
    width,
    height,
    title: params.title,
    subtitle: params.subtitle,
    bg_color,
    bg_image: params.bg_image,
    title_color,
    subtitle_color,
    overlay: params.overlay as 'none' | 'light' | 'medium' | 'dark',
    logo,
    logo_position: params.logo_position as 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right',
    feature_image: params.feature_image,
  } as any);

  return pageShell(thumbnailHtml);
}
