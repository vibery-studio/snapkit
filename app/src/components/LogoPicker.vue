<script setup lang="ts">
/**
 * LogoPicker - radio buttons for logo selection + position buttons (TL/TR/BL/BR)
 */
import type { BrandLogo } from '../types'

const props = defineProps<{
  logos: BrandLogo[]
  modelValue: string           // selected logo URL or ''
  position: string             // 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
}>()

const emit = defineEmits<{
  'update:modelValue': [url: string]
  'update:position': [pos: string]
}>()

const POSITIONS = [
  { label: 'TL', value: 'top-left' },
  { label: 'TR', value: 'top-right' },
  { label: 'BL', value: 'bottom-left' },
  { label: 'BR', value: 'bottom-right' },
]
</script>

<template>
  <div class="logo-picker">
    <!-- Logo options: None + brand logos -->
    <div class="logo-picker__options">
      <!-- None option -->
      <label class="logo-picker__option">
        <input
          type="radio"
          name="logo-pick"
          value=""
          :checked="modelValue === ''"
          @change="emit('update:modelValue', '')"
          class="logo-picker__radio"
        />
        <span class="logo-picker__none">None</span>
      </label>

      <!-- Brand logo options -->
      <label
        v-for="logo in logos"
        :key="logo.id"
        class="logo-picker__option"
        :title="logo.name"
      >
        <input
          type="radio"
          name="logo-pick"
          :value="logo.url"
          :checked="modelValue === logo.url"
          @change="emit('update:modelValue', logo.url)"
          class="logo-picker__radio"
        />
        <img :src="logo.url" :alt="logo.name" class="logo-picker__thumb" />
      </label>
    </div>

    <!-- Position grid (only visible when a logo is selected) -->
    <div v-if="modelValue" class="logo-picker__positions">
      <span class="logo-picker__pos-label">Position</span>
      <div class="logo-picker__pos-grid">
        <button
          v-for="pos in POSITIONS"
          :key="pos.value"
          type="button"
          :class="['logo-picker__pos-btn', { 'logo-picker__pos-btn--active': position === pos.value }]"
          :title="pos.value"
          @click="emit('update:position', pos.value)"
        >
          <span class="logo-picker__pos-dot" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo-picker__options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mp-s2);
  margin-bottom: var(--mp-s3);
}

.logo-picker__option {
  display: flex;
  align-items: center;
  cursor: pointer;
  border: 2px solid var(--mp-rule);
  border-radius: var(--mp-radius-sm);
  padding: 2px;
  transition: border-color 0.15s;
}

.logo-picker__option:has(input:checked) {
  border-color: var(--mp-terra);
}

.logo-picker__radio {
  display: none;
}

.logo-picker__none {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  padding: 6px 10px;
}

.logo-picker__thumb {
  display: block;
  width: 60px;
  height: 36px;
  object-fit: contain;
  background: var(--mp-bg2);
  border-radius: 2px;
}

.logo-picker__positions {
  display: flex;
  align-items: center;
  gap: var(--mp-s3);
}

.logo-picker__pos-label {
  font-family: var(--mp-font-mono);
  font-size: 10px;
  text-transform: uppercase;
  color: var(--mp-muted);
  letter-spacing: 0.04em;
  white-space: nowrap;
}

.logo-picker__pos-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3px;
  width: 44px;
  height: 44px;
  background: var(--mp-rule);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
}

.logo-picker__pos-btn {
  background: var(--mp-bg2);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: background 0.15s;
}

.logo-picker__pos-btn:hover {
  background: var(--mp-bg3);
}

.logo-picker__pos-btn--active {
  background: var(--mp-terra);
}

.logo-picker__pos-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--mp-muted);
}

.logo-picker__pos-btn--active .logo-picker__pos-dot {
  background: #fff;
}
</style>
