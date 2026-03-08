<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { getOverlayGradient, logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFFFFF',
  subtitleColor: '#FFD700',
  overlay: 'none',
  logoPosition: 'bottom-right',
})

// Background style: bgImage > gradient > solid color
const bgStyle = computed(() => {
  const overlayGrad = getOverlayGradient(props.overlay)
  if (props.bgImage && props.bgImage.trim() && !props.bgImage.startsWith('linear-gradient') && !props.bgImage.startsWith('radial-gradient')) {
    const parts = overlayGrad !== 'none' ? `${overlayGrad},` : ''
    return { background: `${parts}url('${props.bgImage}') center/cover no-repeat` }
  }
  if (props.gradientEnd) {
    return { background: `linear-gradient(135deg, ${props.bgColor} 0%, ${props.gradientEnd} 100%)` }
  }
  return { background: props.bgColor }
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '8%',
  maxWidth: '25%',
  objectFit: 'contain' as const,
}))
</script>

<template>
  <!-- Text Only: solid/gradient/image bg with centered text -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      ...bgStyle,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      position: 'relative',
      fontFamily: '\'Montserrat\', sans-serif',
      overflow: 'hidden',
      padding: '8%',
      boxSizing: 'border-box',
    }"
  >
    <img
      v-if="logo"
      :src="logo"
      alt="logo"
      :style="logoStyle"
      crossorigin="anonymous"
      @error="($event.target as HTMLImageElement).style.display = 'none'"
    />
    <h1
      :style="{
        color: titleColor,
        fontWeight: 900,
        fontSize: 'clamp(1.5rem,6vw,4.5rem)',
        lineHeight: 1.15,
        margin: 0,
        letterSpacing: '-0.02em',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }"
    >{{ title }}</h1>
    <p
      v-if="subtitle"
      :style="{
        color: subtitleColor,
        fontWeight: 500,
        fontSize: 'clamp(0.85rem,2.5vw,1.6rem)',
        margin: '0.6em 0 0',
        opacity: 0.9,
        fontFamily: '\'Be Vietnam Pro\', sans-serif',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }"
    >{{ subtitle }}</p>
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
