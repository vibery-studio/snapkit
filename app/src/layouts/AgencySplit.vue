<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFD700',
  subtitleColor: '#FFFFFF',
  logoPosition: 'top-right',
})

// Feature image panel dimensions (48% wide, 85% tall, offset from edge)
const imgW = computed(() => Math.round(props.width * 0.48))
const imgH = computed(() => Math.round(props.height * 0.85))
const imgTop = computed(() => Math.round(props.height * 0.075))
const imgLeft = computed(() => Math.round(props.width * 0.02))

// Color tint overlay (25% opacity)
const tintColor = computed(() => `${props.bgColor}40`)

// Title/subtitle font sizes computed from height
const titleSize = computed(() => `${Math.round(props.height * 0.06)}px`)
const subtitleSize = computed(() => `${Math.round(props.height * 0.042)}px`)
const subtitleMarginTop = computed(() => `${Math.round(props.height * 0.02)}px`)

const logoCornerMap: Record<string, Record<string, string>> = {
  'top-left': { top: '3%', left: '3%' },
  'top-right': { top: '3%', right: '3%' },
  'bottom-left': { bottom: '3%', left: '3%' },
  'bottom-right': { bottom: '3%', right: '3%' },
}

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...(logoCornerMap[props.logoPosition ?? 'top-right'] ?? logoCornerMap['top-right']),
  height: '7%',
  maxWidth: '15%',
  objectFit: 'contain' as const,
}))

// Background style: bgImage with bgColor fallback
const containerBg = computed(() => {
  console.log('AgencySplit bgImage:', props.bgImage, 'bgColor:', props.bgColor, 'featureImage:', props.featureImage)
  const fallback = props.bgColor || '#1a1a3e'
  if (props.bgImage && props.bgImage.trim() && !props.bgImage.startsWith('linear-gradient') && !props.bgImage.startsWith('radial-gradient')) {
    return `url('${props.bgImage}') center/cover no-repeat, ${fallback}`
  }
  return fallback
})
</script>

<template>
  <!-- Agency Split: bg image, feature image left panel, title+subtitle right -->
  <div
    :style="{
      position: 'relative',
      width: `${width}px`,
      height: `${height}px`,
      background: containerBg,
      overflow: 'hidden',
      fontFamily: '\'IBM Plex Sans\', system-ui, sans-serif',
    }"
  >
    <!-- Feature image with mood tint -->
    <div
      v-if="featureImage"
      :style="{
        position: 'absolute',
        top: `${imgTop}px`,
        left: `${imgLeft}px`,
        width: `${imgW}px`,
        height: `${imgH}px`,
        borderRadius: '12px',
        overflow: 'hidden',
      }"
    >
      <img
        :src="featureImage"
        alt=""
        :style="{ width: '100%', height: '100%', objectFit: 'cover' }"
        crossorigin="anonymous"
        @error="($event.target as HTMLImageElement).parentElement!.style.display = 'none'"
      />
      <!-- Color tint overlay -->
      <div
        :style="{
          position: 'absolute',
          inset: 0,
          background: tintColor,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }"
      />
    </div>
    <!-- Right content panel -->
    <div
      :style="{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '50%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 4% 0 2%',
      }"
    >
      <h1
        :style="{
          margin: 0,
          fontSize: titleSize,
          fontWeight: 600,
          lineHeight: 1.25,
          color: titleColor,
          fontStyle: 'italic',
        }"
      >{{ title }}</h1>
      <p
        v-if="subtitle"
        :style="{
          margin: `${subtitleMarginTop} 0 0`,
          fontSize: subtitleSize,
          color: subtitleColor,
          fontStyle: 'italic',
        }"
      >{{ subtitle }}</p>
    </div>
    <!-- Logo -->
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
      }"
      crossorigin="anonymous"
    />
  </div>
</template>
