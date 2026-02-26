// Layout registry - exports all available layouts
import type { Layout } from '../lib/types';
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
