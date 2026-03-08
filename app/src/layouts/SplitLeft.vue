<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFFFFF',
  accentColor: '#FFD700',
  logoPosition: 'bottom-right',
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '10%',
  maxWidth: '30%',
  objectFit: 'contain' as const,
}))
</script>

<template>
  <!-- Split Left: image left 50%, text panel right 50% -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      fontFamily: '\'Montserrat\', sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }"
  >
    <!-- Image panel -->
    <div :style="{ width: '50%', height: '100%', flexShrink: 0, overflow: 'hidden', background: '#333' }">
      <img
        v-if="featureImage"
        :src="featureImage"
        alt=""
        :style="{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }"
        crossorigin="anonymous"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
    </div>
    <!-- Text panel -->
    <div
      :style="{
        width: '50%',
        height: '100%',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '8%',
        boxSizing: 'border-box',
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
      <!-- Accent bar -->
      <div :style="{ width: '3em', height: '4px', background: accentColor, marginBottom: '1em', borderRadius: '2px' }" />
      <h1
        :style="{
          color: titleColor,
          fontWeight: 800,
          fontSize: 'clamp(1.2rem,4vw,3rem)',
          lineHeight: 1.25,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }"
      >{{ title }}</h1>
      <p
        v-if="subtitle"
        :style="{
          color: accentColor,
          fontWeight: 500,
          fontSize: 'clamp(0.8rem,2vw,1.4rem)',
          marginTop: '0.6em',
          opacity: 0.9,
          fontFamily: '\'Be Vietnam Pro\', sans-serif',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
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
