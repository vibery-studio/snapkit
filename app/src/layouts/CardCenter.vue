<script setup lang="ts">
import { computed } from 'vue'
import type { LayoutProps } from './types'
import { logoCornerStyle } from './types'

const props = withDefaults(defineProps<LayoutProps>(), {
  bgColor: '#1a1a3e',
  titleColor: '#FFFFFF',
  logoPosition: 'bottom-right',
})

const logoStyle = computed(() => ({
  position: 'absolute' as const,
  ...logoCornerStyle(props.logoPosition),
  height: '12%',
  maxWidth: '35%',
  objectFit: 'contain' as const,
}))
</script>

<template>
  <!-- Card Center: top 60% feature image, bottom 40% color panel centered text -->
  <div
    :style="{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      flexDirection: 'column',
      fontFamily: '\'Montserrat\', sans-serif',
      overflow: 'hidden',
      position: 'relative',
    }"
  >
    <!-- Feature image -->
    <div :style="{ width: '100%', height: '60%', position: 'relative', flexShrink: 0, overflow: 'hidden', background: '#333' }">
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
        width: '100%',
        height: '40%',
        background: bgColor,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '6% 8%',
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
      <h1
        :style="{
          color: titleColor,
          fontWeight: 800,
          fontSize: 'clamp(1rem,3.5vw,2.5rem)',
          lineHeight: 1.25,
          margin: 0,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }"
      >{{ title }}</h1>
      <p
        v-if="subtitle"
        :style="{
          color: titleColor,
          fontWeight: 400,
          fontSize: 'clamp(0.75rem,2vw,1.2rem)',
          margin: '0.5em 0 0',
          opacity: 0.8,
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
