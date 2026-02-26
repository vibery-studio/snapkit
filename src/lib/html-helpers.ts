// HTML utility functions

export function escapeHtml(str: string | undefined): string {
  if (!str) return '';
  return str.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c] || c));
}

export function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function sanitizeColor(color: string | undefined, fallback: string): string {
  if (!color) return fallback;
  return isValidHexColor(color) ? color : fallback;
}

export function getOverlayGradient(overlay: string | undefined): string {
  switch (overlay) {
    case 'light': return 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2))';
    case 'medium': return 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4))';
    case 'dark': return 'linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6))';
    default: return 'none';
  }
}

// Sanitize URL for CSS context - prevent CSS injection via url()
export function sanitizeUrlForCss(url: string | undefined): string {
  if (!url) return '';
  // Remove dangerous characters that could break out of CSS url()
  const sanitized = url.replace(/['"()\\]/g, '');
  // Only allow http/https/data URLs or relative paths
  if (/^(https?:\/\/|data:|\/)/i.test(sanitized)) {
    return sanitized;
  }
  return '';
}

// Map logo_position string to inline CSS position string (default: top-right)
export function logoPositionStyle(pos: string | undefined): string {
  const map: Record<string, string> = {
    'top-left': 'top:5%;left:5%',
    'top-right': 'top:5%;right:5%',
    'bottom-left': 'bottom:5%;left:5%',
    'bottom-right': 'bottom:5%;right:5%',
  };
  return map[pos || ''] || map['top-right'];
}

// Render watermark img overlay or empty string if no URL provided
export function watermarkHtml(watermarkUrl: string | undefined, opacity: string | undefined): string {
  if (!watermarkUrl) return '';
  const safe = sanitizeUrlForCss(watermarkUrl);
  if (!safe) return '';
  const opacityValue = ({ light: '0.2', medium: '0.4', dark: '0.6' } as Record<string, string>)[opacity || 'light'] || '0.2';
  return `<img src="${safe}" alt="" style="position:absolute;bottom:3%;right:3%;height:6%;max-width:20%;object-fit:contain;opacity:${opacityValue};pointer-events:none;z-index:10;" crossorigin="anonymous" onerror="this.style.display='none'" />`;
}
