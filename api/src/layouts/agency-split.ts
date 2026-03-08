// Agency Split Layout - Background image, feature image left, title+subtitle right, logo top-right
import type { Layout } from '../lib/types';
import { escapeHtml, sanitizeColor } from '../lib/html-helpers';

export const agencySplitLayout: Layout = {
  id: 'agency-split',
  name: 'Agency Split',
  categories: ['landscape', 'wide'],
  defaultSize: 'agency-wide',
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
    { key: 'feature_image', type: 'image', label: 'Feature Image', searchable: true },
  ],
  render: (p) => {
    const w = p.width, h = p.height;
    const bgColor = sanitizeColor(p.bg_color, '#1a1a3e');
    const titleColor = sanitizeColor(p.title_color, '#FFD700');
    const subtitleColor = sanitizeColor(p.subtitle_color, '#FFFFFF');
    const title = escapeHtml(p.title);
    const subtitle = escapeHtml(p.subtitle);
    const featureImg = p.feature_image || '';
    const bgImg = p.bg_image || '/brands/goha/bg/default-background.png';
    const logo = p.logo || '';
    const logoPos = p.logo_position || 'top-right';
    const logoPosMap: Record<string, string> = {
      'top-left': 'top:3%;left:3%',
      'top-right': 'top:3%;right:3%',
      'bottom-left': 'bottom:3%;left:3%',
      'bottom-right': 'bottom:3%;right:3%',
    };
    const imgW = Math.round(w * 0.48), imgH = Math.round(h * 0.85);
    const imgTop = Math.round(h * 0.075), imgLeft = Math.round(w * 0.02);
    // Color tint overlay for mood matching (subtle blend with bg_color)
    const tintColor = bgColor + '40'; // 25% opacity hex

    return `<div id="thumbnail" style="position:relative;width:${w}px;height:${h}px;background:${bgColor};overflow:hidden;font-family:'IBM Plex Sans',system-ui,sans-serif;">
  <!-- Background with brand color overlay -->
  <div style="position:absolute;inset:0;background:url('${bgImg}') center/cover no-repeat;"></div>
  <div style="position:absolute;inset:0;background:linear-gradient(135deg,${bgColor}cc 0%,${bgColor}99 50%,${bgColor}66 100%);mix-blend-mode:multiply;"></div>
  <!-- Feature image with mood tint -->
  ${featureImg ? `<div style="position:absolute;top:${imgTop}px;left:${imgLeft}px;width:${imgW}px;height:${imgH}px;border-radius:12px;overflow:hidden;">
    <img src="${featureImg}" alt="" style="width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" onerror="this.parentElement.style.display='none'" />
    <div style="position:absolute;inset:0;background:${tintColor};mix-blend-mode:multiply;pointer-events:none;"></div>
  </div>` : ''}
  <!-- Right content -->
  <div style="position:absolute;top:0;right:0;width:50%;height:100%;display:flex;flex-direction:column;justify-content:center;padding:0 4% 0 2%;">
    <h1 style="margin:0;font-size:${Math.round(h * 0.06)}px;font-weight:600;line-height:1.25;color:${titleColor};font-style:italic;">${title}</h1>
    ${subtitle ? `<p style="margin:${Math.round(h * 0.02)}px 0 0;font-size:${Math.round(h * 0.042)}px;color:${subtitleColor};font-style:italic;">${subtitle}</p>` : ''}
  </div>
  <!-- Logo -->
  ${logo ? `<img src="${logo}" alt="logo" style="position:absolute;${logoPosMap[logoPos] || logoPosMap['top-right']};height:7%;max-width:15%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />` : ''}
</div>`;
  },
};
