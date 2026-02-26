// Layout: Card Center - Top 60% feature image, bottom 40% color panel with centered text
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss, logoPositionStyle, watermarkHtml } from '../lib/html-helpers';

export const cardCenterLayout: Layout = {
  id: 'card-center',
  name: 'Card Center',
  categories: ['square', 'portrait'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'feature_image', type: 'image', label: 'Feature Image', required: true, searchable: true },
    { key: 'bg_color', type: 'color', label: 'Panel Background Color' },
    { key: 'title_color', type: 'color', label: 'Title Color' },
  ],

  render(p: LayoutRenderParams): string {
    const bg = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const safeLogo = sanitizeUrlForCss(p.logo);

    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;${logoPositionStyle(p.logo_position)};height:12%;max-width:35%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';
    const wmHtml = watermarkHtml(p.watermark_url, p.watermark_opacity);

    const subtitleHtml = subtitle
      ? `<p style="color:${titleColor};font-weight:400;font-size:clamp(0.75rem,2vw,1.2rem);margin:0.5em 0 0;opacity:0.8;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:100%;height:60%;position:relative;flex-shrink:0;overflow:hidden;">
    <img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  </div>
  <div style="width:100%;height:40%;background:${bg};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:6% 8%;box-sizing:border-box;position:relative;">
    ${logoHtml}
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1rem,3.5vw,2.5rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
    ${subtitleHtml}
  </div>
  ${wmHtml}
</div>`;
  },
};
