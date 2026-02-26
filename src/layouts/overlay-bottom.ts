// Layout: Overlay Bottom - Full background image + semi-transparent bottom text bar
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss } from '../lib/html-helpers';

export const overlayBottomLayout: Layout = {
  id: 'overlay-bottom',
  name: 'Overlay Bottom',
  categories: ['landscape', 'square'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'bg_image', type: 'image', label: 'Background Image', required: true, searchable: true },
    { key: 'bg_color', type: 'color', label: 'Fallback Background Color' },
    { key: 'title_color', type: 'color', label: 'Title Color' },
    { key: 'bar_color', type: 'color', label: 'Bar Background Color' },
  ],

  render(p: LayoutRenderParams): string {
    const fallbackBg = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    const params = p as unknown as Record<string, string>;
    const barColor = sanitizeColor(params.bar_color, '#000000');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);

    const safeBgImage = sanitizeUrlForCss(p.bg_image);
    const bgStyle = safeBgImage
      ? `background:url('${safeBgImage}') center/cover no-repeat`
      : `background:${fallbackBg}`;

    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:8%;max-width:25%;object-fit:contain;z-index:2;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';

    const subtitleHtml = subtitle
      ? `<p style="position:relative;color:${titleColor};font-weight:400;font-size:clamp(0.7rem,2vw,1.2rem);margin:0.4em 0 0;opacity:0.85;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${subtitle}</p>`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;">
  ${logoHtml}
  <div style="position:absolute;bottom:0;left:0;right:0;height:30%;padding:0 6%;display:flex;flex-direction:column;justify-content:center;box-sizing:border-box;">
    <div style="position:absolute;inset:0;background:${barColor};opacity:0.88;"></div>
    <h1 style="position:relative;color:${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.2;margin:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${title}</h1>
    ${subtitleHtml}
  </div>
</div>`;
  },
};
