<script setup lang="ts">
import type { BrandKit } from '../types'

// Brand selector: dropdown list of available brand kits
const props = defineProps<{
  brands: BrandKit[]
  modelValue: BrandKit | null
  loading?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [brand: BrandKit | null]
}>()

function onChange(e: Event) {
  const id = (e.target as HTMLSelectElement).value
  const brand = props.brands.find(b => b.id === id) ?? null
  emit('update:modelValue', brand)
}
</script>

<template>
  <div class="brand-selector">
    <label class="brand-selector__label">Brand</label>

    <div class="brand-selector__wrap">
      <select
        class="brand-selector__select"
        :disabled="loading || brands.length === 0"
        :value="modelValue?.id ?? ''"
        @change="onChange"
      >
        <option value="">— No brand —</option>
        <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
      </select>
      <span class="brand-selector__caret" aria-hidden="true">▾</span>
    </div>

    <!-- Color swatches for selected brand -->
    <div v-if="modelValue" class="brand-selector__swatches">
      <span
        v-for="(hex, key) in modelValue.colors"
        :key="key"
        class="brand-selector__swatch"
        :style="{ background: hex }"
        :title="String(key)"
      />
    </div>
  </div>
</template>

<style scoped>
.brand-selector__label {
  display: block;
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--mp-s1);
}

.brand-selector__wrap {
  position: relative;
}

.brand-selector__select {
  appearance: none;
  width: 100%;
  background: var(--mp-bg2);
  border: 1px solid transparent;
  border-radius: var(--mp-radius);
  padding: 10px 32px 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  cursor: pointer;
  outline: none;
  transition: border-color 0.15s;
}

.brand-selector__select:focus {
  border-color: var(--mp-terra);
}

.brand-selector__select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.brand-selector__caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mp-muted);
  pointer-events: none;
  font-size: 12px;
}

.brand-selector__swatches {
  display: flex;
  gap: var(--mp-s1);
  margin-top: var(--mp-s2);
  flex-wrap: wrap;
}

.brand-selector__swatch {
  display: block;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 1px solid var(--mp-rule);
  flex-shrink: 0;
}
</style>
