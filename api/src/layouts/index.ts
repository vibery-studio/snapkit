// Layout registry - exports all available layouts (built-in + custom)
import type { Layout } from '../lib/types';
import { overlayCenterLayout } from './overlay-center';
import { splitLeftLayout } from './split-left';
import { splitRightLayout } from './split-right';
import { overlayBottomLayout } from './overlay-bottom';
import { cardCenterLayout } from './card-center';
import { textOnlyLayout } from './text-only';
import { collage2Layout } from './collage-2';
import { frameLayout } from './frame';
import { agencySplitLayout } from './agency-split';
import { CUSTOM_LAYOUTS } from '../data/custom-layouts';

// Built-in layouts
const BUILTIN_LAYOUTS: Record<string, Layout> = {
  'overlay-center': overlayCenterLayout,
  'split-left': splitLeftLayout,
  'split-right': splitRightLayout,
  'overlay-bottom': overlayBottomLayout,
  'card-center': cardCenterLayout,
  'text-only': textOnlyLayout,
  'collage-2': collage2Layout,
  'frame': frameLayout,
  'agency-split': agencySplitLayout,
};

// Merge built-in + custom layouts
export const LAYOUTS: Record<string, Layout> = {
  ...BUILTIN_LAYOUTS,
  ...CUSTOM_LAYOUTS,
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

export function getLayoutById(id: string): Layout | undefined {
  return LAYOUTS[id];
}

export function getLayoutsForCategory(category: string): Layout[] {
  return Object.values(LAYOUTS).filter(l => l.categories.includes(category as any));
}

// Resolve layout by ID - checks built-in first
export function resolveLayout(id: string): Layout | null {
  return LAYOUTS[id] || null;
}

// Resolve layout with D1 fallback for custom layouts
import type { Env } from '../lib/types';
import { d1Get } from '../lib/d1-helpers';
import { renderCustomLayoutHtml } from '../lib/template-engine';

interface CustomLayoutRow {
  id: string;
  name: string;
  categories: string;
  params: string;
  html: string;
  css: string | null;
}

export async function resolveLayoutAsync(id: string, env: Env): Promise<Layout | null> {
  // Check built-in first
  if (LAYOUTS[id]) return LAYOUTS[id];

  // Check D1 for custom layout
  const row = await d1Get<CustomLayoutRow>(env, 'SELECT * FROM layouts WHERE id = ?', [id]);
  if (!row) return null;

  // Convert DB row to Layout with render function
  return {
    id: row.id,
    name: row.name,
    categories: JSON.parse(row.categories),
    params: JSON.parse(row.params),
    render: (p) => renderCustomLayoutHtml(row.html, row.css || '', p),
  };
}
