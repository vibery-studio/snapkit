// Layout registry - exports all available layouts
import type { Env, Layout } from '../lib/types';
import { r2GetJson } from '../lib/r2-helpers';
import { createLayoutFromTemplate, type CustomLayoutData } from '../lib/template-engine';
import { overlayCenterLayout } from './overlay-center';
import { splitLeftLayout } from './split-left';
import { splitRightLayout } from './split-right';
import { overlayBottomLayout } from './overlay-bottom';
import { cardCenterLayout } from './card-center';
import { textOnlyLayout } from './text-only';
import { collage2Layout } from './collage-2';
import { frameLayout } from './frame';

export const LAYOUTS: Record<string, Layout> = {
  'overlay-center': overlayCenterLayout,
  'split-left': splitLeftLayout,
  'split-right': splitRightLayout,
  'overlay-bottom': overlayBottomLayout,
  'card-center': cardCenterLayout,
  'text-only': textOnlyLayout,
  'collage-2': collage2Layout,
  'frame': frameLayout,
};

export const LAYOUT_IDS = Object.keys(LAYOUTS);

export function getLayoutById(id: string): Layout | undefined {
  return LAYOUTS[id];
}

export function getLayoutsForCategory(category: string): Layout[] {
  return Object.values(LAYOUTS).filter(l => l.categories.includes(category as any));
}

/**
 * Resolve layout by ID: built-in registry first, then R2 custom layouts.
 * Returns null if not found in either.
 */
export async function resolveLayout(id: string, env: Env): Promise<Layout | null> {
  // Fast path: built-in layout
  if (LAYOUTS[id]) return LAYOUTS[id];

  // Slow path: fetch custom layout JSON from R2
  try {
    const data = await r2GetJson<CustomLayoutData>(env, `layouts/${id}.json`);
    if (data) return createLayoutFromTemplate(data);
  } catch {
    // R2 miss or parse error — fall through to null
  }

  return null;
}
