<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  frameColor: '#FFD700',
  logoPosition: 'bottom-right',
})

// Frame inset: 3% of the smaller dimension
const inset = computed(() => Math.round(Math.min(props.width, props.height) * 0.03))

const logoCornerMap: Record<string, Record<string, string>> = {
  'top-left': { top: 'calc(3% + 1em)', left: 'calc(3% + 1em)' },
  'top-right': { top: 'calc(3% + 1em)', right: 'calc(3% + 1em)' },
  'bottom-left': { bottom: 'calc(3% + 1em)', left: 'calc(3% + 1em)' },
  'bottom-right': { bottom: 'calc(3% + 1em)', right: 'calc(3% + 1em)' },
}

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...(logoCornerMap[props.logoPosition ?? 'bottom-right'] ?? logoCornerMap['bottom-right']),
  height: '8%',
  maxWidth: '25%',
  objectFit: 'contain' as const,
  zIndex: 3,
}))
</script>

<template>
  <!-- Frame: feature image fills canvas with branded border frame overlay -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      position: 'relative',
      fontFamily: '\'Montserrat\', sans-serif',
      overflow: 'hidden',
      background: featureImage ? '#000' : '#ddd',
    }"
  >
    <img
      v-if="featureImage"
      :src="featureImage"
      alt=""
      :style="{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }"
      crossorigin="anonymous"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    <!-- Frame border overlay via box-shadow inset -->
    <div
      :style="{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        boxShadow: `inset 0 0 0 ${inset}px ${frameColor}`,
        zIndex: 2,
      }"
    />
    <img
      v-if="logo"
      :src="logo"
      alt="logo"
      :style="logoStyle"
      crossorigin="anonymous"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    <!-- Watermark -->
    <img
      v-if="watermarkUrl"
      :src="watermarkUrl"
      alt=""
      :style="{
        position: 'absolute',
        bottom: '2%',
        right: '2%',
        height: '6%',
        maxWidth: '20%',
        objectFit: 'contain',
        opacity: watermarkOpacity === 'light' ? 0.3 : watermarkOpacity === 'dark' ? 0.8 : 0.55,
        pointerEvents: 'none',
        zIndex: 4,
      }"
      crossorigin="anonymous"
    />
  </div>
</template>
