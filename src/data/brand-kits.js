// Brand kit definitions
// MVP: GOHA brand only
export const BRANDS = {
  goha: {
    id: 'goha',
    name: 'GOHA',
    colors: {
      primary: '#1a1a3e',
      secondary: '#FFD700',
      accent: '#FF6B35',
      text_light: '#FFFFFF',
      text_dark: '#1a1a3e',
    },
    fonts: {
      heading: 'Montserrat',
      body: 'Be Vietnam Pro',
    },
    logos: [
      { id: 'main', url: '/brands/goha/logos/goha-white.svg', name: 'GOHA White' },
    ],
    default_text_color: '#FFFFFF',
    default_overlay: 'dark',
  },
};

export function getBrandById(id) {
  return BRANDS[id] || null;
}

export function getBrandColorPalette(brandId) {
  const brand = BRANDS[brandId];
  if (!brand) return [];
  return Object.entries(brand.colors).map(([name, value]) => ({ name, value }));
}
