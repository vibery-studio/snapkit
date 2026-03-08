<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { getOverlayGradient, logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFD700',
  subtitleColor: '#FFFFFF',
  overlay: 'none',
  logoPosition: 'bottom-right',
})

const bgStyle = computed(() => {
  const overlayGrad = getOverlayGradient(props.overlay)
  // Only use bgImage if it's a non-empty URL (not gradient/color)
  if (props.bgImage && props.bgImage.trim() && !props.bgImage.startsWith('linear-gradient') && !props.bgImage.startsWith('radial-gradient')) {
    const parts = overlayGrad !== 'none' ? `${overlayGrad},` : ''
    return { background: `${parts}url('${props.bgImage}') center/cover no-repeat` }
  }
  // bgColor can be solid color OR gradient
  return { background: props.bgColor }
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '8%',
  objectFit: 'contain' as const,
}))
</script>

<template>
  <!-- Overlay Center: full background image, centered text overlay -->
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
        fontWeight: 800,
        fontSize: 'clamp(1.5rem,5vw,4rem)',
        lineHeight: 1.2,
        margin: 0,
        padding: '0 8%',
        fontFamily: '\'Montserrat\', sans-serif',
      }"
    >{{ title }}</h1>
    <p
      v-if="subtitle"
      :style="{
        color: subtitleColor,
        fontWeight: 500,
        fontSize: 'clamp(0.9rem,2.5vw,1.8rem)',
        marginTop: '0.5em',
        padding: '0 10%',
        opacity: 0.9,
        fontFamily: '\'Be Vietnam Pro\', sans-serif',
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
