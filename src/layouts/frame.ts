// Layout: Frame - User image fills canvas with branded border frame overlay + logo in configurable corner
import type { Layout, LayoutRenderParams } from '../lib/types';
import { sanitizeColor, sanitizeUrlForCss } from '../lib/html-helpers';

export const frameLayout: Layout = {
  id: 'frame',
  name: 'Frame',
  categories: ['landscape', 'square', 'portrait', 'wide'],
  params: [
    { key: 'feature_image', type: 'image', label: 'Feature Image', required: true, searchable: true },
    { key: 'frame_color', type: 'color', label: 'Frame Color' },
    { key: 'logo_position', type: 'select', label: 'Logo Position', options: ['top-left', 'top-right', 'bottom-left', 'bottom-right'] },
  ],

  render(p: LayoutRenderParams): string {
    const imgUrl = sanitizeUrlForCss(p.feature_image);
    const params = p as unknown as Record<string, string>;
    const frameColor = sanitizeColor(params.frame_color, '#FFD700');
    const logoPos = params.logo_position || 'bottom-right';

    // Frame inset: 3% of the smaller dimension
    const inset = Math.round(Math.min(p.width, p.height) * 0.03);

    // Logo corner positioning
    const logoCornerStyle: Record<string, string> = {
      'top-left': 'top:calc(3% + 1em);left:calc(3% + 1em)',
      'top-right': 'top:calc(3% + 1em);right:calc(3% + 1em)',
      'bottom-left': 'bottom:calc(3% + 1em);left:calc(3% + 1em)',
      'bottom-right': 'bottom:calc(3% + 1em);right:calc(3% + 1em)',
    };
    const logoPos2Style = logoCornerStyle[logoPos] || logoCornerStyle['bottom-right'];

    const safeLogo = sanitizeUrlForCss(p.logo);
    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="logo" style="position:absolute;${logoPos2Style};height:8%;max-width:25%;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';

    return `<div id="thumbnail" style="width:${p.width}px;height:${p.height}px;position:relative;font-family:'Montserrat',sans-serif;overflow:hidden;background:#000;">
  <img src="${imgUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" onerror="this.style.background='#333'" />
  <div style="position:absolute;inset:0;pointer-events:none;box-shadow:inset 0 0 0 ${inset}px ${frameColor};z-index:2;"></div>
  ${logoHtml}
</div>`;
  },
};
