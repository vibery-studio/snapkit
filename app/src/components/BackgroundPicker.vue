<script setup lang="ts">
/**
 * BackgroundPicker - tabs for Brand | Search | Gradient | Color | Upload
 * Emits a background URL or CSS value when user picks an option.
 */
import { ref } from 'vue'
import MpInput from './ui/MpInput.vue'
import MpButton from './ui/MpButton.vue'
import { apiFetch } from '../api/client'
import type { BrandBackground } from '../types'

const props = defineProps<{
  brandBackgrounds: BrandBackground[]
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

type Tab = 'brand' | 'search' | 'gradient' | 'color' | 'upload'
const activeTab = ref<Tab>('brand')

// Search state
const searchQuery = ref('')
const searchResults = ref<{ url: string; thumb: string; alt: string; credit: string }[]>([])
const searching = ref(false)

async function runSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  try {
    const data = await apiFetch<{ url: string; thumb: string; alt: string; credit: string }[]>(
      `/api/search/images?q=${encodeURIComponent(searchQuery.value)}`
    )
    searchResults.value = data
  } finally {
    searching.value = false
  }
}

// Color
const solidColor = ref('#1a1a2e')

function pickColor() {
  emit('update:modelValue', solidColor.value)
}

// Gradient presets
const GRADIENTS = [
  { label: 'Night', value: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' },
  { label: 'Ocean', value: 'linear-gradient(135deg,#2980b9,#2c3e50)' },
  { label: 'Sunset', value: 'linear-gradient(135deg,#f7971e,#ffd200)' },
  { label: 'Forest', value: 'linear-gradient(135deg,#134e5e,#71b280)' },
  { label: 'Berry', value: 'linear-gradient(135deg,#6a3093,#a044ff)' },
  { label: 'Fire', value: 'linear-gradient(135deg,#f12711,#f5af19)' },
  { label: 'Steel', value: 'linear-gradient(135deg,#485563,#29323c)' },
  { label: 'Mint', value: 'linear-gradient(135deg,#00b09b,#96c93d)' },
]

// Upload
const fileInput = ref<HTMLInputElement | null>(null)

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = (ev) => {
    emit('update:modelValue', ev.target?.result as string)
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="bg-picker">
    <!-- Tab bar -->
    <div class="bg-picker__tabs">
      <button
        v-for="tab in (['brand','search','gradient','color','upload'] as Tab[])"
        :key="tab"
        :class="['bg-picker__tab', { 'bg-picker__tab--active': activeTab === tab }]"
        type="button"
        @click="activeTab = tab"
      >{{ tab }}</button>
    </div>

    <!-- Brand tab -->
    <div v-if="activeTab === 'brand'" class="bg-picker__grid">
      <p v-if="!brandBackgrounds.length" class="bg-picker__empty">No brand backgrounds</p>
      <button
        v-for="(bg, i) in brandBackgrounds"
        :key="i"
        class="bg-picker__thumb-btn"
        :class="{ 'bg-picker__thumb-btn--active': modelValue === bg.url }"
        type="button"
        @click="emit('update:modelValue', bg.url)"
        :title="bg.name"
      >
        <img :src="bg.url" :alt="bg.name" class="bg-picker__thumb" loading="lazy" />
      </button>
    </div>

    <!-- Search tab -->
    <div v-if="activeTab === 'search'" class="bg-picker__search">
      <div class="bg-picker__search-bar">
        <MpInput v-model="searchQuery" placeholder="Search Unsplash / Pexels…" @keydown.enter="runSearch" />
        <MpButton size="sm" variant="secondary" :loading="searching" @click="runSearch">Go</MpButton>
      </div>
      <div class="bg-picker__grid" v-if="searchResults.length">
        <button
          v-for="(img, i) in searchResults"
          :key="i"
          class="bg-picker__thumb-btn"
          :class="{ 'bg-picker__thumb-btn--active': modelValue === img.url }"
          type="button"
          @click="emit('update:modelValue', img.url)"
          :title="img.alt || img.credit"
        >
          <img :src="img.thumb" :alt="img.alt" class="bg-picker__thumb" loading="lazy" />
        </button>
      </div>
    </div>

    <!-- Gradient tab -->
    <div v-if="activeTab === 'gradient'" class="bg-picker__grid">
      <button
        v-for="g in GRADIENTS"
        :key="g.value"
        class="bg-picker__thumb-btn"
        :class="{ 'bg-picker__thumb-btn--active': modelValue === g.value }"
        type="button"
        @click="emit('update:modelValue', g.value)"
        :title="g.label"
      >
        <div class="bg-picker__thumb" :style="{ background: g.value }" />
        <span class="bg-picker__grad-label">{{ g.label }}</span>
      </button>
    </div>

    <!-- Color tab -->
    <div v-if="activeTab === 'color'" class="bg-picker__color">
      <input type="color" v-model="solidColor" class="bg-picker__color-input" @change="pickColor" />
      <MpButton size="sm" variant="secondary" @click="pickColor">Apply</MpButton>
    </div>

    <!-- Upload tab -->
    <div v-if="activeTab === 'upload'" class="bg-picker__upload">
      <input ref="fileInput" type="file" accept="image/*" class="bg-picker__file-input" @change="onFileChange" />
      <MpButton size="sm" variant="secondary" @click="triggerUpload">Choose File</MpButton>
    </div>
  </div>
</template>

<style scoped>
.bg-picker__tabs {
  display: flex;
  gap: 2px;
  margin-bottom: var(--mp-s3);
  border-bottom: 1px solid var(--mp-rule);
  padding-bottom: var(--mp-s2);
  flex-wrap: wrap;
}

.bg-picker__tab {
  background: none;
  border: none;
  font-family: var(--mp-font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--mp-muted);
  cursor: pointer;
  padding: var(--mp-s1) var(--mp-s2);
  border-radius: var(--mp-radius-sm);
  transition: background 0.1s, color 0.1s;
}

.bg-picker__tab:hover { color: var(--mp-ink); background: var(--mp-bg2); }
.bg-picker__tab--active { color: var(--mp-terra); background: var(--mp-bg2); }

.bg-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mp-s2);
  max-height: 200px;
  overflow-y: auto;
}

.bg-picker__thumb-btn {
  position: relative;
  border: 2px solid transparent;
  background: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
  aspect-ratio: 16/9;
  transition: border-color 0.15s;
}

.bg-picker__thumb-btn--active { border-color: var(--mp-terra); }

.bg-picker__thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bg-picker__grad-label {
  position: absolute;
  bottom: 2px;
  left: 0;
  right: 0;
  font-family: var(--mp-font-mono);
  font-size: 9px;
  color: #fff;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0,0,0,0.7);
}

.bg-picker__empty {
  font-size: 12px;
  color: var(--mp-muted);
  grid-column: 1 / -1;
  text-align: center;
  padding: var(--mp-s4) 0;
}

.bg-picker__search-bar {
  display: flex;
  gap: var(--mp-s2);
  align-items: flex-end;
  margin-bottom: var(--mp-s3);
}
.bg-picker__search-bar > :first-child { flex: 1; }

.bg-picker__color {
  display: flex;
  align-items: center;
  gap: var(--mp-s3);
  padding: var(--mp-s3) 0;
}

.bg-picker__color-input {
  width: 56px;
  height: 40px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius-sm);
  cursor: pointer;
  padding: 2px;
  background: none;
}

.bg-picker__upload {
  padding: var(--mp-s4) 0;
}

.bg-picker__file-input {
  display: none;
}
</style>
