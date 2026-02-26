// Layout: Text Only - Bold text on solid or gradient background, no images
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor } from '../lib/html-helpers';

export const textOnlyLayout: Layout = {
  id: 'text-only',
  name: 'Text Only',
  categories: ['landscape', 'square', 'portrait', 'wide'],
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'subtitle', type: 'text', label: 'Subtitle' },
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

    // Use gradient if gradient_end provided, otherwise solid color
    const bgStyle = gradientEnd
      ? `background:linear-gradient(135deg, ${bgStart} 0%, ${gradientEnd} 100%)`
      : `background:${bgStart}`;

    const logoHtml = p.logo
      ? `<img src="${p.logo}" alt="logo" style="position:absolute;bottom:5%;right:5%;height:8%;max-width:25%;object-fit:contain;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';

    const subtitleHtml = subtitle
      ? `<p style="color:${subColor};font-weight:500;font-size:clamp(0.85rem,2.5vw,1.6rem);margin:0.6em 0 0;opacity:0.9;font-family:'Be Vietnam Pro',sans-serif;overflow:hidden;text-overflow:ellipsis;">${subtitle}</p>`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;${bgStyle};display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;padding:8%;box-sizing:border-box;">
  ${logoHtml}
  <h1 style="color:${titleColor};font-weight:900;font-size:clamp(1.5rem,6vw,4.5rem);line-height:1.15;margin:0;letter-spacing:-0.02em;overflow:hidden;text-overflow:ellipsis;">${title}</h1>
  ${subtitleHtml}
</div>`;
  },
};
