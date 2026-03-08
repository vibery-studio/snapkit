// Layout component registry - maps layout IDs to async Vue components
import { defineAsyncComponent } from 'vue'

export const LAYOUT_COMPONENTS: Record<string, ReturnType<typeof defineAsyncComponent>> = {
  'split-left': defineAsyncComponent(() => import('./SplitLeft.vue')),
  'split-right': defineAsyncComponent(() => import('./SplitRight.vue')),
  'overlay-center': defineAsyncComponent(() => import('./OverlayCenter.vue')),
  'overlay-bottom': defineAsyncComponent(() => import('./OverlayBottom.vue')),
  'card-center': defineAsyncComponent(() => import('./CardCenter.vue')),
  'text-only': defineAsyncComponent(() => import('./TextOnly.vue')),
  'collage-2': defineAsyncComponent(() => import('./Collage2.vue')),
  'frame': defineAsyncComponent(() => import('./Frame.vue')),
  'agency-split': defineAsyncComponent(() => import('./AgencySplit.vue')),
}

export type { LayoutProps } from './types'
