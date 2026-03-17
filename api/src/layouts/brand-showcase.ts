// Layout: Brand Showcase - Full-bleed image + frame overlay (exported from Figma) + logo, title, CTA, footer
// Uses brand's frame overlay PNG for pixel-perfect panel+stripes instead of CSS approximation
import type { Layout, LayoutRenderParams } from '../lib/types';
import { escapeHtml, sanitizeColor, sanitizeUrlForCss, watermarkHtml } from '../lib/html-helpers';

export const brandShowcaseLayout: Layout = {
  id: 'brand-showcase',
  name: 'Brand Showcase',
  categories: ['square', 'portrait'],
  defaultSize: 'ig-post',
  params: [
    { key: 'title', type: 'text', label: 'Title', required: true },
    { key: 'cta_text', type: 'text', label: 'CTA Button Text' },
    { key: 'footer_text', type: 'text', label: 'Footer (contact info)' },
    { key: 'feature_image', type: 'image', label: 'Feature Image', required: true, searchable: true },
    { key: 'frame_image', type: 'image', label: 'Frame Overlay Image' },
    { key: 'accent_color', type: 'color', label: 'Accent/CTA Color' },
  ],

  render(p: LayoutRenderParams): string {
    const w = p.width, h = p.height;
    const params = p as unknown as Record<string, string>;
    const titleColor = sanitizeColor(p.title_color, '#FFFFFF');
    const accentColor = sanitizeColor(params.accent_color, '#fc7400');
    const title = escapeHtml(p.title);
    const ctaText = escapeHtml(params.cta_text) || '';
    const footerText = escapeHtml(params.footer_text) || '';
    const featureImg = sanitizeUrlForCss(p.feature_image);
    const frameImg = sanitizeUrlForCss(params.frame_image) || '';
    const safeLogo = sanitizeUrlForCss(p.logo);
    const wmHtml = watermarkHtml(p.watermark_url, p.watermark_opacity);
    const font = (params.font_heading as string) || 'Google Sans';

    // Proportional sizing (base 1080x1080)
    const s = h / 1080;
    const logoTop = Math.round(40 * s);
    const logoLeft = Math.round(42 * s);
    const logoH = Math.round(100 * s);
    const titleTop = Math.round(250 * s);
    const titleLeft = Math.round(42 * s);
    const titleW = Math.round(440 * s);
    const titleSize = Math.round(54 * s);
    const ctaTop = Math.round(698 * s);
    const ctaLeft = Math.round(42 * s);
    const ctaSize = Math.round(28 * s);
    const ctaPadV = Math.round(18 * s);
    const ctaPadH = Math.round(56 * s);
    const footerTop = Math.round(818 * s);
    const footerLeft = Math.round(42 * s);
    const footerW = Math.round(460 * s);
    const footerSize = Math.round(20 * s);
    const iconSize = Math.round(18 * s);

    const logoHtml = safeLogo
      ? `<img src="${safeLogo}" alt="" style="position:absolute;top:${logoTop}px;left:${logoLeft}px;height:${logoH}px;max-width:${Math.round(w * 0.4)}px;object-fit:contain;z-index:3;" crossorigin="anonymous" onerror="this.style.display='none'" />`
      : '';

    const ctaHtml = ctaText
      ? `<div style="position:absolute;top:${ctaTop}px;left:${ctaLeft}px;z-index:3;">
          <span style="display:inline-block;background:${accentColor};color:#FFFFFF;font-family:'${font}',sans-serif;font-weight:700;font-size:${ctaSize}px;padding:${ctaPadV}px ${ctaPadH}px;border-radius:${Math.round(6 * s)}px;letter-spacing:0.5px;">${ctaText}</span>
        </div>`
      : '';

    // Footer with inline SVG icons for phone, email, web
    const phoneSvg = `<svg viewBox="0 0 24 24" style="width:${iconSize}px;height:${iconSize}px;fill:${titleColor};flex-shrink:0;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`;
    const emailSvg = `<svg viewBox="0 0 24 24" style="width:${iconSize}px;height:${iconSize}px;fill:${titleColor};flex-shrink:0;"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>`;
    const webSvg = `<svg viewBox="0 0 24 24" style="width:${iconSize}px;height:${iconSize}px;flex-shrink:0;"><circle cx="12" cy="12" r="10" fill="none" stroke="${titleColor}" stroke-width="2"/><path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" fill="none" stroke="${titleColor}" stroke-width="1.5"/></svg>`;

    let footerHtml = '';
    if (footerText) {
      const lines = footerText.split('\n').filter(l => l.trim());
      const icons = [phoneSvg, emailSvg, webSvg];
      const footerLines = lines.map((line, i) => {
        const icon = icons[i] || '';
        return `<div style="display:flex;align-items:center;gap:${Math.round(10 * s)}px;">${icon}${escapeHtml(line)}</div>`;
      }).join('');
      footerHtml = `<div style="position:absolute;top:${footerTop}px;left:${footerLeft}px;width:${footerW}px;z-index:3;color:${titleColor};font-size:${footerSize}px;line-height:2;font-family:'${font}',sans-serif;">${footerLines}</div>`;
    }

    const frameHtml = frameImg
      ? `<img src="${frameImg}" alt="" style="position:absolute;top:0;left:0;height:100%;z-index:1;" crossorigin="anonymous" />`
      : '';

    return `<div id="thumbnail" style="position:relative;width:${w}px;height:${h}px;overflow:hidden;font-family:'${font}',sans-serif;">
  ${featureImg ? `<img src="${featureImg}" alt="" style="position:absolute;top:0;left:0;width:100%;height:100%;object-fit:cover;" crossorigin="anonymous" />` : `<div style="position:absolute;inset:0;background:#333;"></div>`}
  ${frameHtml}
  ${logoHtml}
  <div style="position:absolute;top:${titleTop}px;left:${titleLeft}px;width:${titleW}px;z-index:3;">
    <h1 style="margin:0;font-weight:700;font-size:${titleSize}px;line-height:1.22;color:${titleColor};font-family:'${font}',sans-serif;">${title}</h1>
  </div>
  ${ctaHtml}
  ${footerHtml}
  ${wmHtml}
</div>`;
  },
};
