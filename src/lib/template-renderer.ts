// Renders a Design into a complete standalone HTML page for screenshot capture
import type { Design, Env } from './types';
import { getLayoutById } from '../layouts';
import { getBrandById } from '../data/brand-kits';
import { getSizeById } from '../data/size-presets';

// Full page shell wrapping the layout's #thumbnail output
function pageShell(thumbnailHtml: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
</body>
</html>`;
}

// Render a saved design object into a full HTML page string
export async function renderDesignToHTML(design: Design, _env: Env): Promise<string> {
  const layout = getLayoutById(design.layout);
  if (!layout) throw new Error(`Unknown layout: ${design.layout}`);

  // Resolve dimensions from preset or design.size
  const preset = getSizeById(design.size.preset);
  const width = preset?.w ?? design.size.width;
  const height = preset?.h ?? design.size.height;

  // Resolve brand for color/logo defaults (optional)
  const brand = design.brand ? getBrandById(design.brand) : undefined;

  // Merge brand defaults with design.params (design.params wins)
  const params = design.params as Record<string, string>;
  const bg_color = params.bg_color || brand?.colors.primary;
  const title_color = params.title_color || brand?.colors.secondary;
  const subtitle_color = params.subtitle_color || brand?.colors.text_light;

  // Resolve logo: only show if showLogo param is truthy
  const showLogo = params.showLogo === 'true' || params.showLogo === '1';
  const logo = showLogo && brand?.logos[0]?.url ? brand.logos[0].url : undefined;

  const thumbnailHtml = layout.render({
    width,
    height,
    title: params.title,
    subtitle: params.subtitle,
    bg_color,
    bg_image: params.bg_image,
    title_color,
    subtitle_color,
    overlay: params.overlay as any,
    logo,
    feature_image: params.feature_image,
  });

  return pageShell(thumbnailHtml);
}

// Render from inline query params (no R2 lookup)
export function renderInlineToHTML(
  layoutId: string,
  sizeId: string,
  params: Record<string, string>
): string {
  const layout = getLayoutById(layoutId);
  if (!layout) throw new Error(`Unknown layout: ${layoutId}`);

  const preset = getSizeById(sizeId);
  if (!preset) throw new Error(`Unknown size preset: ${sizeId}`);

  const thumbnailHtml = layout.render({
    width: preset.w,
    height: preset.h,
    title: params.title,
    subtitle: params.subtitle,
    bg_color: params.bg_color,
    bg_image: params.bg_image,
    title_color: params.title_color,
    subtitle_color: params.subtitle_color,
    overlay: params.overlay as any,
    logo: params.logo,
    feature_image: params.feature_image,
  });

  return pageShell(thumbnailHtml);
}
