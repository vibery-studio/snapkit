// Custom layouts registry - organized by brand
import type { Layout, LayoutParam } from '../../lib/types';
import { escapeHtml, sanitizeColor } from '../../lib/html-helpers';

interface CustomLayoutData {
  id: string;
  name: string;
  brand: string;
  categories: Array<'landscape' | 'square' | 'portrait' | 'wide'>;
  params: LayoutParam[];
  html: string;
}

// All custom layouts with brand scope - inline data for simplicity
const ALL_LAYOUTS: CustomLayoutData[] = [
  {
    id: 'split-layout-123',
    name: 'Split Layout 123',
    brand: 'goha',
    categories: ['landscape'],
    params: [
      { key: 'title', label: 'Title', type: 'text', required: true },
      { key: 'subtitle', label: 'Subtitle', type: 'text' },
      { key: 'feature_image', label: 'Feature Image', type: 'image', searchable: true, required: true },
      { key: 'bg_color', label: 'Background Color', type: 'color' },
      { key: 'title_color', label: 'Title Color', type: 'color' },
      { key: 'subtitle_color', label: 'Subtitle Color', type: 'color' },
    ],
    html: '<div id="thumbnail" style="width:{{width}}px;height:{{height}}px;display:flex;font-family:\'Montserrat\',sans-serif;overflow:hidden;position:relative;"><div style="width:50%;height:100%;flex-shrink:0;overflow:hidden;"><img src="{{feature_image}}" alt="" style="width:100%;height:100%;object-fit:cover;display:block;" crossorigin="anonymous" /></div><div style="width:50%;height:100%;background:{{bg_color}};display:flex;flex-direction:column;justify-content:center;padding:8%;box-sizing:border-box;"><div style="width:3em;height:4px;background:#FFD700;margin-bottom:1em;border-radius:2px;"></div><h1 style="color:{{title_color}};font-weight:800;font-size:clamp(1.2rem,4vw,3rem);line-height:1.25;margin:0;">{{title}}</h1><p style="color:{{subtitle_color}};font-weight:500;font-size:clamp(0.8rem,2vw,1.4rem);margin-top:0.6em;opacity:0.9;font-family:\'Be Vietnam Pro\',sans-serif;">{{subtitle}}</p></div></div>',
  },
];

// Build values map for {{key}} replacement
function buildValues(p: Record<string, unknown>): Record<string, string> {
  return {
    width: String(p.width || 1280),
    height: String(p.height || 720),
    title: escapeHtml(String(p.title || '')),
    subtitle: escapeHtml(String(p.subtitle || '')),
    bg_color: sanitizeColor(p.bg_color as string, '#1a1a3e'),
    bg_image: String(p.bg_image || ''),
    title_color: sanitizeColor(p.title_color as string, '#FFFFFF'),
    subtitle_color: sanitizeColor(p.subtitle_color as string, '#FFD700'),
    logo: String(p.logo || ''),
    feature_image: String(p.feature_image || ''),
    image_1: String(p.image_1 || ''),
    image_2: String(p.image_2 || ''),
  };
}

// Convert to Layout object
function createLayout(data: CustomLayoutData): Layout & { brand: string } {
  return {
    id: data.id,
    name: data.name,
    brand: data.brand,
    categories: data.categories,
    params: data.params,
    render: (p) => {
      const values = buildValues(p as unknown as Record<string, unknown>);
      return data.html.replace(/\{\{(\w+)\}\}/g, (_, key) => values[key] ?? '');
    },
  };
}

// Export all custom layouts
export const CUSTOM_LAYOUTS: Record<string, Layout> = {};
export const CUSTOM_LAYOUTS_BY_BRAND: Record<string, Layout[]> = {};

for (const data of ALL_LAYOUTS) {
  const layout = createLayout(data);
  CUSTOM_LAYOUTS[data.id] = layout;
  if (!CUSTOM_LAYOUTS_BY_BRAND[data.brand]) CUSTOM_LAYOUTS_BY_BRAND[data.brand] = [];
  CUSTOM_LAYOUTS_BY_BRAND[data.brand].push(layout);
}

export function getCustomLayoutsByBrand(brand: string): Layout[] {
  return CUSTOM_LAYOUTS_BY_BRAND[brand] || [];
}

export const CUSTOM_LAYOUT_IDS = Object.keys(CUSTOM_LAYOUTS);
