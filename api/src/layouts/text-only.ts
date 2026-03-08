// Layout: Text Only - Bold text on solid, gradient, or image background
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss, getOverlayGradient, logoPositionStyle, watermarkHtml } from '../lib/html-helpers';

export const textOnlyLayout: Layout = {
  id: 'text-only',
  name: 'Text Only',
  categories: ['landscape', 'square', 'portrait', 'wide'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'bg_image', type: 'image', label: 'Background Image', searchable: true },
    { key: 'overlay', type: 'select', label: 'Overlay', options: ['none', 'light', 'medium', 'dark'] },
    { key: 'bg_color', type: 'color', label: 'Background Color' },
    { key: 'gradient_end', type: 'color', label: 'Gradient End Color' },
    { key: 'title_color', type: 'color', label: 'Title Color' },
    { key: 'subtitle_color', type: 'color', label: 'Subtitle Color' },
  ],

  render(p: LayoutRenderParams): string {
    const bgStart = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    const subColor = sanitizeColor(p.subtitle_color, '#FFD700');
    const params = p as unknown as Record<string, string>;
    const gradientEnd = sanitizeColor(params.gradient_end, '');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const safeBgImage = sanitizeUrlForCss(p.bg_image);
    const hasBgImage = safeBgImage && safeBgImage !== 'undefined' && safeBgImage !== 'null';
    const overlay = getOverlayGradient(p.overlay);

    // Priority: bg_image > gradient > solid color
    let bgStyle: string;
    if (hasBgImage) {
      bgStyle = `background:${overlay !== 'none' ? overlay + ',' : ''}url('${safeBgImage}') center/cover no-repeat`;
    } else if (gradientEnd) {
      bgStyle = `background:linear-gradient(135deg, ${bgStart} 0%, ${gradientEnd} 100%)`;
    } else {
      bgStyle = `background:${bgStart}`;
    }

    const logoHtml = p.logo
      ? `<img src="${p.logo}" alt="logo" style="position:absolute;${logoPositionStyle(p.logo_position)};height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';
    const wmHtml = watermarkHtml(p.watermark_url, p.watermark_opacity);

    const subtitleHtml = subtitle
      ? `<p style="color:${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">
  ${logoHtml}
  <h1 style="color:${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
  ${subtitleHtml}
  ${wmHtml}
</div>`;
  },
};
