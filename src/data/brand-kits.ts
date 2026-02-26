// Brand kit definitions (hardcoded fallback when R2 unavailable)
// R2 path: brands/{id}/kit.json — checked first, this data used as fallback
import type { BrandKit } from '../lib/types';

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
      { id: 'main', url: '/brands/goha/logos/goha-white.svg', name: 'GOHA White' },
      { id: 'dark', url: '/brands/goha/logos/goha-dark.png', name: 'GOHA Dark' },
      { id: 'icon', url: '/brands/goha/logos/goha-icon.png', name: 'GOHA Icon' },
    ],
    backgrounds: [
      { url: '/brands/goha/bg/circuit-board.png', tags: ['tech', 'ai'], name: 'Circuit Board' },
      { url: '/brands/goha/bg/data-flow.png', tags: ['tech', 'data'], name: 'Data Flow' },
    ],
    watermark: {
      url: '/brands/goha/watermark.png',
      default_opacity: 'light',
    },
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
      { id: 'main', url: '/brands/tonyfriends/logos/tonyfriends-white.svg', name: "Tony's Friends White" },
    ],
    backgrounds: [],
    watermark: {
      url: '/brands/tonyfriends/watermark.png',
      default_opacity: 'light',
    },
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
      { id: 'main', url: '/brands/vibery/logos/vibery-white.svg', name: 'Vibery White' },
    ],
    backgrounds: [],
    watermark: {
      url: '/brands/vibery/watermark.png',
      default_opacity: 'light',
    },
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
