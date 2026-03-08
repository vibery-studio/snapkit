// Client-side shared types (mirrored from api/src/lib/types.ts, render fn excluded)

export interface SizePreset {
  id: string;
  name: string;
  w: number;
  h: number;
  category: 'landscape' | 'square' | 'portrait' | 'wide';
}

export interface BrandKit {
  id: string;
  name: string;
  slug: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text_light: string;
    text_dark: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logos: BrandLogo[];
  backgrounds: BrandBackground[];
  watermark?: {
    url: string;
    default_opacity: 'light' | 'medium' | 'dark';
  };
  default_text_color: string;
  default_overlay: 'light' | 'medium' | 'dark';
}

export interface BrandLogo {
  id: string;
  url: string;
  name: string;
}

export interface BrandBackground {
  url: string;
  tags: string[];
  name: string;
}

export interface LayoutParam {
  key: string;
  type: 'text' | 'color' | 'image' | 'select';
  label: string;
  required?: boolean;
  options?: string[];
  searchable?: boolean;
}

export interface Layout {
  id: string;
  name: string;
  categories: Array<'landscape' | 'square' | 'portrait' | 'wide'>;
  params: LayoutParam[];
  defaultSize?: string;
}

export interface Design {
  id: string;
  created_at: string;
  updated_at: string;
  size: {
    preset: string;
    width: number;
    height: number;
  };
  layout: string;
  brand: string;
  params: Record<string, string | boolean | number>;
  forked_from?: string;
}

export interface BackgroundItem {
  url: string;
  tags: string[];
  name: string;
  category: string;
}
