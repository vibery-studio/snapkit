<script setup lang="ts">
import type { BrandKit } from '../types'

defineProps<{
  brand: BrandKit
  active?: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<template>
  <div
    :class="['brand-card', { 'brand-card--active': active }]"
    role="button"
    tabindex="0"
    @click="emit('select')"
    @keydown.enter="emit('select')"
  >
    <!-- Color swatches -->
    <div class="brand-card__swatches">
      <span
        v-for="(color, key) in brand.colors"
        :key="key"
        class="brand-card__swatch"
        :style="{ background: color }"
        :title="String(key)"
      />
    </div>

    <!-- Logo preview -->
    <div class="brand-card__logo-wrap">
      <img
        v-if="brand.logos?.[0]"
        :src="brand.logos[0].url"
        :alt="brand.name"
        class="brand-card__logo"
      />
      <span v-else class="brand-card__logo-placeholder">
        {{ brand.name.charAt(0).toUpperCase() }}
      </span>
    </div>

    <!-- Brand name + meta -->
    <div class="brand-card__meta">
      <span class="brand-card__name">{{ brand.name }}</span>
      <span class="brand-card__slug">{{ brand.slug }}</span>
    </div>
  </div>
</template>

<style scoped>
.brand-card {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s3);
  padding: var(--mp-s4);
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
  border: 1.5px solid transparent;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
}

.brand-card:hover {
  background: var(--mp-bg3);
  border-color: var(--mp-rule);
}

.brand-card--active {
  border-color: var(--mp-terra);
  background: var(--mp-bg3);
}

.brand-card__swatches {
  display: flex;
  gap: 4px;
}

.brand-card__swatch {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1px solid rgba(0,0,0,0.08);
  flex-shrink: 0;
}

.brand-card__logo-wrap {
  width: 40px;
  height: 40px;
  border-radius: var(--mp-radius-sm, 4px);
  overflow: hidden;
  background: var(--mp-bg3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.brand-card__logo {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-card__logo-placeholder {
  font-family: var(--mp-font-heading);
  font-weight: 700;
  font-size: 18px;
  color: var(--mp-muted);
}

.brand-card__meta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--mp-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-card__slug {
  font-family: var(--mp-font-mono);
  font-size: 10px;
  color: var(--mp-light, var(--mp-muted));
}
</style>
