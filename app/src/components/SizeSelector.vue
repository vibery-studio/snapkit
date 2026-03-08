<script setup lang="ts">
import { computed } from 'vue'
import type { SizePreset } from '../types'

// Size selector: grid of size preset cards, grouped by category
const props = defineProps<{
  sizes: SizePreset[]
  modelValue: SizePreset | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [size: SizePreset]
}>()

const categories: Array<SizePreset['category']> = ['landscape', 'square', 'portrait', 'wide']

const grouped = computed(() => {
  return categories
    .map(cat => ({
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      cat,
      items: props.sizes.filter(s => s.category === cat),
    }))
    .filter(g => g.items.length > 0)
})

function select(size: SizePreset) {
  emit('update:modelValue', size)
}
</script>

<template>
  <div class="size-selector">
    <div v-if="loading" class="size-selector__loading">Loading sizes…</div>

    <div v-else v-for="group in grouped" :key="group.cat" class="size-selector__group">
      <p class="size-selector__cat-label">{{ group.label }}</p>
      <div class="size-selector__grid">
        <button
          v-for="size in group.items"
          :key="size.id"
          :class="['size-selector__item', { 'size-selector__item--active': modelValue?.id === size.id }]"
          @click="select(size)"
          type="button"
        >
          <!-- Visual ratio indicator -->
          <span class="size-selector__thumb" :style="{ aspectRatio: `${size.w} / ${size.h}` }" />
          <span class="size-selector__name">{{ size.name }}</span>
          <span class="size-selector__dims">{{ size.w }}×{{ size.h }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.size-selector__loading {
  font-family: var(--mp-font-mono);
  font-size: 12px;
  color: var(--mp-muted);
  padding: var(--mp-s3) 0;
}

.size-selector__group {
  margin-bottom: var(--mp-s4);
}

.size-selector__cat-label {
  font-family: var(--mp-font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mp-muted);
  margin: 0 0 var(--mp-s2) 0;
}

.size-selector__grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mp-s2);
}

.size-selector__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mp-s1);
  padding: var(--mp-s2);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  background: var(--mp-bg);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  text-align: center;
}

.size-selector__item:hover {
  border-color: var(--mp-sand);
  background: var(--mp-bg2);
}

.size-selector__item--active {
  border-color: var(--mp-terra);
  background: var(--mp-bg2);
}

.size-selector__thumb {
  display: block;
  width: 100%;
  max-width: 40px;
  background: var(--mp-bg3);
  border-radius: 2px;
  min-height: 8px;
  max-height: 32px;
}

.size-selector__item--active .size-selector__thumb {
  background: var(--mp-terra);
  opacity: 0.3;
}

.size-selector__name {
  font-family: var(--mp-font-body);
  font-size: 11px;
  font-weight: 500;
  color: var(--mp-ink);
  line-height: 1.2;
}

.size-selector__dims {
  font-family: var(--mp-font-mono);
  font-size: 10px;
  color: var(--mp-muted);
}
</style>
