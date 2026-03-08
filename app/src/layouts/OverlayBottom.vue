<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFFFFF',
  barColor: '#000000',
  logoPosition: 'top-right',
})

const bgStyle = computed(() => {
  if (props.bgImage && props.bgImage.trim() && !props.bgImage.startsWith('linear-gradient') && !props.bgImage.startsWith('radial-gradient')) {
    return { background: `url('${props.bgImage}') center/cover no-repeat` }
  }
  return { background: props.bgColor }
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '8%',
  maxWidth: '25%',
  objectFit: 'contain' as const,
  zIndex: 2,
}))
</script>

<template>
  <!-- Overlay Bottom: full bg image, semi-transparent bottom text bar -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      ...bgStyle,
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
    <!-- Bottom text bar -->
    <div
      :style="{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        padding: '0 6%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        boxSizing: 'border-box',
      }"
    >
      <!-- Semi-transparent bar background -->
      <div
        :style="{
          position: 'absolute',
          inset: 0,
          background: barColor,
          opacity: 0.88,
        }"
      />
      <h1
        :style="{
          position: 'relative',
          color: titleColor,
          fontWeight: 800,
          fontSize: 'clamp(1rem,3.5vw,2.5rem)',
          lineHeight: 1.2,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }"
      >{{ title }}</h1>
      <p
        v-if="subtitle"
        :style="{
          position: 'relative',
          color: titleColor,
          fontWeight: 400,
          fontSize: 'clamp(0.7rem,2vw,1.2rem)',
          margin: '0.4em 0 0',
          opacity: 0.85,
          fontFamily: '\'Be Vietnam Pro\', sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }"
      >{{ subtitle }}</p>
    </div>
    <!-- Watermark -->
    <img
      v-if="watermarkUrl"
      :src="watermarkUrl"
      alt=""
      :style="{
        position: 'absolute',
        bottom: '32%',
        right: '2%',
        height: '6%',
        maxWidth: '20%',
        objectFit: 'contain',
        opacity: watermarkOpacity === 'light' ? 0.3 : watermarkOpacity === 'dark' ? 0.8 : 0.55,
        pointerEvents: 'none',
        zIndex: 2,
      }"
      crossorigin="anonymous"
    />
  </div>
</template>
