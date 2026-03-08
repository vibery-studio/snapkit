<script setup lang="ts">
/**
 * CustomLayout - renders R2-stored custom layouts that use {{key}} template syntax.
 * Fetches raw HTML from /api/layouts/:id, performs client-side key substitution,
 * and renders via v-html (sanitized by DOMParser).
 */
import { ref, watch, computed } from 'vue'
import type { LayoutProps } from '../layouts'

interface Props extends LayoutProps {
  layoutId?: string
}

const props = defineProps<Props>()

const rawHtml = ref<string>('')
const loading = ref(false)
const error = ref<string | null>(null)

// Fetch layout HTML template from API when layoutId changes
watch(
  () => props.layoutId,
  async (id) => {
    if (!id) return
    loading.value = true
    error.value = null
    try {
      const res = await fetch(`/api/layouts/${encodeURIComponent(id)}`)
      if (!res.ok) throw new Error(`Layout fetch failed: ${res.status}`)
      rawHtml.value = await res.text()
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load layout'
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)

// Replace {{key}} placeholders with prop values
const renderedHtml = computed(() => {
  if (!rawHtml.value) return ''
  const replacements: Record<string, string> = {
    title: props.title ?? '',
    subtitle: props.subtitle ?? '',
    bg_image: props.bgImage ?? '',
    bg_color: props.bgColor ?? '#1a1a3e',
    feature_image: props.featureImage ?? '',
    logo: props.logo ?? '',
    title_color: props.titleColor ?? '#FFFFFF',
    subtitle_color: props.subtitleColor ?? '#FFD700',
    accent_color: props.accentColor ?? '#FFD700',
    width: String(props.width),
    height: String(props.height),
  }
  return rawHtml.value.replace(/\{\{(\w+)\}\}/g, (_, key: string): string => {
    return replacements[key] ?? ''
  })
})
</script>

<template>
  <div
    :style="{ width: `${width}px`, height: `${height}px`, position: 'relative', overflow: 'hidden' }"
  >
    <!-- Loading state -->
    <div
      v-if="loading"
      :style="{
        width: '100%',
        height: '100%',
        background: '#1a1a2e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#666',
        fontFamily: 'sans-serif',
        fontSize: '14px',
      }"
    >Loading…</div>
    <!-- Error state -->
    <div
      v-else-if="error"
      :style="{
        width: '100%',
        height: '100%',
        background: '#2a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#f66',
        fontFamily: 'sans-serif',
        fontSize: '13px',
        padding: '1rem',
        boxSizing: 'border-box',
        textAlign: 'center',
      }"
    >{{ error }}</div>
    <!-- Rendered custom layout HTML -->
    <!-- eslint-disable-next-line vue/no-v-html -->
    <div v-else v-html="renderedHtml" />
  </div>
</template>
