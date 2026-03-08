<script setup lang="ts">
/**
 * LayoutRenderer - resolves a layout ID to a Vue component and renders it
 * with a CSS scale transform so it fits inside any preview container.
 */
import { computed, defineAsyncComponent } from 'vue'
import { LAYOUT_COMPONENTS } from '../layouts'
import type { LayoutProps } from '../layouts'
import CustomLayout from './CustomLayout.vue'

interface Props extends LayoutProps {
  layoutId: string
  /** Scale factor (0–1) for preview fitting. Defaults to 1 (no scaling). */
  scale?: number
}

const props = withDefaults(defineProps<Props>(), {
  scale: 1,
})

// Resolve component: built-in registry first, fallback to CustomLayout for R2 layouts
const layoutComponent = computed(() => {
  return LAYOUT_COMPONENTS[props.layoutId] ?? defineAsyncComponent(() => Promise.resolve(CustomLayout))
})

// Pass all LayoutProps down to the resolved component (exclude renderer-only props)
const layoutProps = computed((): LayoutProps => {
  const { layoutId: _id, scale: _scale, ...rest } = props
  console.log('LayoutRenderer featureImage:', rest.featureImage ? 'SET' : 'NOT SET', 'layoutId:', _id)
  return rest
})
</script>

<template>
  <!-- Wrapper applies the scale transform for preview fitting -->
  <div
    class="layout-renderer"
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      transform: `scale(${scale})`,
      transformOrigin: 'top left',
      flexShrink: 0,
    }"
  >
    <Suspense>
      <component :is="layoutComponent" v-bind="layoutProps" />
      <template #fallback>
        <div
          :style="{
            width: `${width}px`,
            height: `${height}px`,
            background: '#1a1a2e',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666',
            fontFamily: 'sans-serif',
            fontSize: '14px',
          }"
        >Loading layout…</div>
      </template>
    </Suspense>
  </div>
</template>
