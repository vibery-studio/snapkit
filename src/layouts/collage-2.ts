// Layout: Collage 2 - Two images side by side with title bar at bottom
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss } from '../lib/html-helpers';

export const collage2Layout: Layout = {
  id: 'collage-2',
  name: 'Collage 2',
  categories: ['landscape'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'image_1', type: 'image', label: 'Image 1', required: true, searchable: true },
    { key: 'image_2', type: 'image', label: 'Image 2', required: true, searchable: true },
    { key: 'bg_color', type: 'color', label: 'Background Color' },
    { key: 'title_color', type: 'color', label: 'Title Color' },
  ],

  render(p: LayoutRenderParams): string {
    const bg = sanitizeColor(p.bg_color, '#111111');
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    const title = escapeHtml(p.title);
    const params = p as unknown as Record<string, string>;
    const img1 = sanitizeUrlForCss(params.image_1);
    const img2 = sanitizeUrlForCss(params.image_2);
    const safeLogo = sanitizeUrlForCss(p.logo);

    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;top:5%;right:5%;height:9%;max-width:25%;object-fit:contain;z-index:2;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';

    // Images take top 78%, title bar takes bottom 22%
    // Each image is 40% wide with gap, centered horizontally
    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;background:${bg};display:flex;flex-direction:column;font-family:'Montserrat',sans-serif;overflow:hidden;position:relative;">
  ${logoHtml}
  <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:2%;padding:3% 5%;box-sizing:border-box;overflow:hidden;">
    <div style="width:46%;height:100%;overflow:hidden;border-radius:4px;">
      <img src="${img1}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
    </div>
    <div style="width:46%;height:100%;overflow:hidden;border-radius:4px;">
      <img src="${img2}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
    </div>
  </div>
  <div style="height:22%;display:flex;align-items:center;justify-content:center;padding:0 6%;box-sizing:border-box;border-top:2px solid rgba(255,255,255,0.1);">
    <h1 style="color:${titleColor};font-weight:800;font-size:clamp(0.9rem,3vw,2rem);line-height:1.2;margin:0;text-align:center;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:100%;">${title}</h1>
  </div>
</div>`;
  },
};
