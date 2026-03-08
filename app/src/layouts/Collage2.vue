<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#111111',
  titleColor: '#FFFFFF',
  logoPosition: 'bottom-right',
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '9%',
  maxWidth: '25%',
  objectFit: 'contain' as const,
  zIndex: 2,
}))
</script>

<template>
  <!-- Collage 2: two images side by side, title bar at bottom -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      background: bgColor,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '\'Montserrat\', sans-serif',
      overflow: 'hidden',
      position: 'relative',
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
    <!-- Images row (top ~78%) -->
    <div
      :style="{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '2%',
        padding: '3% 5%',
        boxSizing: 'border-box',
        overflow: 'hidden',
      }"
    >
      <div :style="{ width: '46%', height: '100%', overflow: 'hidden', borderRadius: '4px', background: '#333' }">
        <img
          v-if="image1"
          :src="image1"
          alt=""
          :style="{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }"
          crossorigin="anonymous"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>
      <div :style="{ width: '46%', height: '100%', overflow: 'hidden', borderRadius: '4px', background: '#333' }">
        <img
          v-if="image2"
          :src="image2"
          alt=""
          :style="{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }"
          crossorigin="anonymous"
          @error="($event.target as HTMLImageElement).style.display = 'none'"
        />
      </div>
    </div>
    <!-- Title bar (bottom 22%) -->
    <div
      :style="{
        height: '22%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 6%',
        boxSizing: 'border-box',
        borderTop: '2px solid rgba(255,255,255,0.1)',
      }"
    >
      <h1
        :style="{
          color: titleColor,
          fontWeight: 800,
          fontSize: 'clamp(0.9rem,3vw,2rem)',
          lineHeight: 1.2,
          margin: 0,
          textAlign: 'center',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }"
      >{{ title }}</h1>
    </div>
    <!-- Watermark -->
    <img
      v-if="watermarkUrl"
      :src="watermarkUrl"
      alt=""
      :style="{
        position: 'absolute',
        bottom: '24%',
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
