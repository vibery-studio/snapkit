<script setup lang="ts">
import { computed } from 'vue'
import type { Layout, SizePreset } from '../types'

// Layout selector: grid of layout cards filtered by selected size category
const props = defineProps<{
  layouts: Layout[]
  modelValue: Layout | null
  selectedSize: SizePreset | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [layout: Layout]
}>()

// Filter layouts by the current size category; show all if no size selected
const filtered = computed(() => {
  if (!props.selectedSize) return props.layouts
  return props.layouts.filter(l => l.categories.includes(props.selectedSize!.category))
})

function select(layout: Layout) {
  emit('update:modelValue', layout)
}
</script>

<template>
  <div class="layout-selector">
    <div v-if="loading" class="layout-selector__loading">Loading layouts…</div>

    <p v-else-if="filtered.length === 0" class="layout-selector__empty">
      No layouts available for this size.
    </p>

    <div v-else class="layout-selector__grid">
      <button
        v-for="layout in filtered"
        :key="layout.id"
        :class="['layout-selector__item', { 'layout-selector__item--active': modelValue?.id === layout.id }]"
        @click="select(layout)"
        type="button"
      >
        <!-- Layout preview placeholder - Phase 5 LayoutRenderer will replace this -->
        <span class="layout-selector__preview">
          <span class="layout-selector__preview-inner">
            <span class="layout-selector__preview-bar layout-selector__preview-bar--top" />
            <span class="layout-selector__preview-bar layout-selector__preview-bar--mid" />
            <span class="layout-selector__preview-bar layout-selector__preview-bar--bot" />
          </span>
        </span>
        <span class="layout-selector__name">{{ layout.name }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.layout-selector__loading,
.layout-selector__empty {
  font-family: var(--mp-font-mono);
  font-size: 12px;
  color: var(--mp-muted);
  padding: var(--mp-s3) 0;
}

.layout-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mp-s2);
}

.layout-selector__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mp-s2);
  padding: var(--mp-s3);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  background: var(--mp-bg);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
}

.layout-selector__item:hover {
  border-color: var(--mp-sand);
  background: var(--mp-bg2);
}

.layout-selector__item--active {
  border-color: var(--mp-terra);
  background: var(--mp-bg2);
}

/* Abstract layout preview bars */
.layout-selector__preview {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--mp-bg3);
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.layout-selector__preview-inner {
  display: flex;
  flex-direction: column;
  gap: 3px;
  width: 60%;
  align-items: flex-start;
}

.layout-selector__preview-bar {
  display: block;
  height: 3px;
  background: var(--mp-muted);
  border-radius: 2px;
  opacity: 0.4;
}

.layout-selector__preview-bar--top { width: 100%; }
.layout-selector__preview-bar--mid { width: 70%; }
.layout-selector__preview-bar--bot { width: 50%; }

.layout-selector__item--active .layout-selector__preview-bar {
  background: var(--mp-terra);
  opacity: 0.6;
}

.layout-selector__name {
  font-family: var(--mp-font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--mp-ink);
  line-height: 1.3;
}
</style>
