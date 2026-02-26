// Layout: Split Left - Image left 50%, text panel right 50%
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss, logoPositionStyle, watermarkHtml } from '../lib/html-helpers';

export const splitLeftLayout: Layout = {
  id: 'split-left',
  name: 'Split Left',
  categories: ['landscape'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'feature_image', type: 'image', label: 'Feature Image', required: true, searchable: true },
    { key: 'bg_color', type: 'color', label: 'Panel Background Color' },
    { key: 'title_color', type: 'color', label: 'Title Color' },
    { key: 'accent_color', type: 'color', label: 'Accent Color' },
  ],

  render(p: LayoutRenderParams): string {
    const bg = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    // Access extra params via cast since LayoutRenderParams is the base type
    const params = p as unknown as Record<string, string>;
    const accentColor = sanitizeColor(params.accent_color, '#FFD700');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const safeLogo = sanitizeUrlForCss(p.logo);

    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;${logoPositionStyle(p.logo_position)};height:10%;max-width:30%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';
    const wmHtml = watermarkHtml(p.watermark_url, p.watermark_opacity);

    const subtitleHtml = subtitle
      ? `<p style="color:${accentColor};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>`
      : '';

    const accentBar = `<div style="width:3em;height:4px;background:${accentColor};margin-bottom:1em;border-radius:2px;"></div>`;

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;display:flex;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  <div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;">
    <img src="${imgUrl}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  </div>
  <div style="width:50%;height:100%;background:${bg};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;position:relative;">
    ${logoHtml}
    ${accentBar}
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
    ${subtitleHtml}
  </div>
  ${wmHtml}
</div>`;
  },
};
