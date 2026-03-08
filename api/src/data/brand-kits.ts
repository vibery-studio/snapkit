// Brand kit definitions (hardcoded fallback when R2 unavailable)
// R2 path: brands/{id}/kit.json — checked first, this data used as fallback
import type { BrandKit } from '../lib/types';

// SVG logo generators for fallback when R2 assets missing
const svgLogo = (text: string, bg: string, fg: string) =>
  `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 40"><rect width="120" height="40" rx="6" fill="${bg}"/><text x="60" y="26" text-anchor="middle" fill="${fg}" font-family="system-ui" font-weight="700" font-size="16">${text}</text></svg>`)}`;

export const BRANDS: Record<string, BrandKit> = {
  goha: {
    id: 'goha',
    name: 'GOHA',
    slug: 'goha',
    colors: {
      primary: '#1a1a3e',
      secondary: '#FFD700',
      accent: '#FF6B35',
      text_light: '#FFFFFF',
      text_dark: '#1a1a3e',
    },
    fonts: { heading: 'Montserrat', body: 'Be Vietnam Pro' },
    logos: [
      { id: 'main', url: '/brands/goha/logos/goha-logo-write.png', name: 'GOHA White' },
      { id: 'fallback', url: svgLogo('GOHA', '#1a1a3e', '#FFD700'), name: 'GOHA SVG' },
    ],
    backgrounds: [
      { url: '/brands/goha/bg/default-background.png', tags: ['tech', 'ai'], name: 'Agency Default' },
      { url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', tags: ['tech', 'ai'], name: 'Matrix Code' },
      { url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&q=80', tags: ['tech', 'data'], name: 'AI Network' },
    ],
    watermark: undefined,
    default_text_color: '#FFFFFF',
    default_overlay: 'dark',
  },
  tonyfriends: {
    id: 'tonyfriends',
    name: "Tony's Friends",
    slug: 'tonyfriends',
    colors: {
      primary: '#2D3436',
      secondary: '#00B894',
      accent: '#FDCB6E',
      text_light: '#FFFFFF',
      text_dark: '#2D3436',
    },
    fonts: { heading: 'Montserrat', body: 'Be Vietnam Pro' },
    logos: [
      { id: 'main', url: svgLogo("Tony's", '#2D3436', '#00B894'), name: "Tony's Friends" },
    ],
    backgrounds: [
      { url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80', tags: ['team', 'meeting'], name: 'Team Meeting' },
    ],
    watermark: undefined,
    default_text_color: '#FFFFFF',
    default_overlay: 'medium',
  },
  vibery: {
    id: 'vibery',
    name: 'Vibery',
    slug: 'vibery',
    colors: {
      primary: '#6C5CE7',
      secondary: '#A29BFE',
      accent: '#FD79A8',
      text_light: '#FFFFFF',
      text_dark: '#2D3436',
    },
    fonts: { heading: 'Montserrat', body: 'Be Vietnam Pro' },
    logos: [
      { id: 'main', url: svgLogo('Vibery', '#6C5CE7', '#FFFFFF'), name: 'Vibery Main' },
    ],
    backgrounds: [
      { url: 'https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=800&q=80', tags: ['gradient', 'purple'], name: 'Purple Gradient' },
    ],
    watermark: undefined,
    default_text_color: '#FFFFFF',
    default_overlay: 'dark',
  },
};

export const BRAND_IDS = Object.keys(BRANDS);

export function getBrandById(id: string): BrandKit | undefined {
  return BRANDS[id];
}

export function getDefaultBrand(): BrandKit {
  return BRANDS.goha;
}
