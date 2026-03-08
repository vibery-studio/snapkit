// Layout: Overlay Center - Full background + centered text
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, getOverlayGradient, sanitizeUrlForCss, logoPositionStyle, watermarkHtml } from '../lib/html-helpers';

export const overlayCenterLayout: Layout = {
  id: 'overlay-center',
  name: 'Overlay Center',
  categories: ['landscape', 'square'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'bg_color', type: 'color', label: 'Background Color' },
    { key: 'bg_image', type: 'image', label: 'Background Image', searchable: true },
    { key: 'title_color', type: 'color', label: 'Title Color' },
    { key: 'subtitle_color', type: 'color', label: 'Subtitle Color' },
    { key: 'overlay', type: 'select', label: 'Overlay', options: ['none', 'light', 'medium', 'dark'] },
  ],

  render(p: LayoutRenderParams): string {
    const bg = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFD700');
    const subColor = sanitizeColor(p.subtitle_color, '#FFFFFF');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const overlay = getOverlayGradient(p.overlay);

    const safeBgImage = sanitizeUrlForCss(p.bg_image);
    const bgStyle = safeBgImage
      ? `background:${overlay !== 'none' ? overlay + ',' : ''}url('${safeBgImage}') center/cover no-repeat`
      : `background:${bg}`;

    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;${logoPositionStyle(p.logo_position)};height:8%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';
    const wmHtml = watermarkHtml(p.watermark_url, p.watermark_opacity);

    const subtitleHtml = subtitle
      ? `<p style="color:${subColor};font-weight:500;font-size:clamp(0.9rem,2.5vw,1.8rem);margin-top:0.5em;padding:0 10%;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;">${subtitle}</p>`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  ${logoHtml}
  <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1.5rem,5vw,4rem);line-height:1.2;margin:0;padding:0 8%;font-family:'Montserrat',sans-serif;">${title}</h1>
  ${subtitleHtml}
  ${wmHtml}
</div>`;
  },
};
