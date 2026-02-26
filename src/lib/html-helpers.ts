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
