// Shared TypeScript types for SnapKit

export interface Env {
  R2_BUCKET: R2Bucket;
  DB: D1Database;
  ASSETS: { fetch: (req: Request) => Promise<Response> };
  UNSPLASH_ACCESS_KEY?: string;
  PEXELS_API_KEY?: string;
  AI?: { run: (model: string, input: unknown) => Promise<{ response?: string }> };
  WINDMILL_BASE?: string;
  WINDMILL_TOKEN?: string;
  WINDMILL_WORKSPACE?: string;
  TONYAPI_KEY?: string;
}

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
  options?: string[]; // for select type
  searchable?: boolean; // for image type
}

export interface Layout {
  id: string;
  name: string;
  categories: Array<'landscape' | 'square' | 'portrait' | 'wide'>;
  params: LayoutParam[];
  defaultSize?: string;
  render: (params: LayoutRenderParams) => string;
}

export interface LayoutRenderParams {
  width: number;
  height: number;
  title?: string;
  subtitle?: string;
  bg_color?: string;
  bg_image?: string;
  title_color?: string;
  subtitle_color?: string;
  logo?: string;
  logo_position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  feature_image?: string;
  image_1?: string;
  image_2?: string;
  overlay?: 'none' | 'light' | 'medium' | 'dark';
  watermark_url?: string;
  watermark_opacity?: 'light' | 'medium' | 'dark';
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
  forked_from?: string; // ID of source design if forked
}

export interface BackgroundItem {
  url: string;
  tags: string[];
  name: string;
  category: string;
}
