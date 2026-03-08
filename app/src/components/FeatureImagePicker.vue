<script setup lang="ts">
/**
 * FeatureImagePicker - preview thumbnail + search Unsplash + upload + clear
 */
import { ref, watch } from 'vue'
import MpButton from './ui/MpButton.vue'
import MpInput from './ui/MpInput.vue'
import { apiFetch } from '../api/client'

const props = defineProps<{
  modelValue: string
}>()

// Debug: watch modelValue changes
watch(() => props.modelValue, (val) => {
  console.log('FeatureImagePicker: modelValue changed, length:', val?.length ?? 0)
}, { immediate: true })

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

const searchQuery = ref('')
const searchResults = ref<{ url: string; thumb: string; alt: string; credit: string }[]>([])
const searching = ref(false)
const showResults = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

async function runSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  showResults.value = false
  try {
    const data = await apiFetch<{ url: string; thumb: string; alt: string; credit: string }[]>(
      `/api/search/images?q=${encodeURIComponent(searchQuery.value)}`
    )
    searchResults.value = data
    showResults.value = true
  } finally {
    searching.value = false
  }
}

function pick(url: string) {
  emit('update:modelValue', url)
  showResults.value = false
}

function triggerUpload() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  console.log('FeatureImagePicker: file selected', file.name, file.type, file.size)
  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    console.log('FeatureImagePicker: read complete, length:', dataUrl?.length ?? 0)
    emit('update:modelValue', dataUrl)
  }
  reader.readAsDataURL(file)
}
</script>

<template>
  <div class="fi-picker">
    <!-- Current preview -->
    <div class="fi-picker__preview" :class="{ 'fi-picker__preview--empty': !props.modelValue }">
      <img v-if="props.modelValue" :src="props.modelValue" alt="Feature image" class="fi-picker__preview-img" />
      <span v-else class="fi-picker__preview-hint">No image</span>
    </div>

    <!-- Search bar -->
    <div class="fi-picker__search-bar">
      <MpInput
        v-model="searchQuery"
        placeholder="Search Unsplash…"
        @keydown.enter="runSearch"
      />
      <MpButton size="sm" variant="secondary" :loading="searching" @click="runSearch">Go</MpButton>
    </div>

    <!-- Search results grid -->
    <div v-if="showResults && searchResults.length" class="fi-picker__grid">
      <button
        v-for="(img, i) in searchResults"
        :key="i"
        type="button"
        class="fi-picker__grid-item"
        @click="pick(img.url)"
        :title="img.alt || img.credit"
      >
        <img :src="img.thumb" :alt="img.alt" class="fi-picker__grid-thumb" loading="lazy" />
      </button>
    </div>

    <!-- Upload + Clear -->
    <div class="fi-picker__actions">
      <input ref="fileInput" type="file" accept="image/*" class="fi-picker__file-input" @change="onFileChange" />
      <MpButton size="sm" variant="ghost" @click="triggerUpload">Upload</MpButton>
      <MpButton size="sm" variant="ghost" :disabled="!props.modelValue" @click="emit('update:modelValue', '')">Clear</MpButton>
    </div>
  </div>
</template>

<style scoped>
.fi-picker__preview {
  width: 100%;
  aspect-ratio: 16/9;
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
  background: var(--mp-bg2);
  border: 1px solid var(--mp-rule);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--mp-s3);
}

.fi-picker__preview-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.fi-picker__preview-hint {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
}

.fi-picker__search-bar {
  display: flex;
  gap: var(--mp-s2);
  align-items: flex-end;
  margin-bottom: var(--mp-s3);
}
.fi-picker__search-bar > :first-child { flex: 1; }

.fi-picker__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mp-s2);
  max-height: 180px;
  overflow-y: auto;
  margin-bottom: var(--mp-s3);
}

.fi-picker__grid-item {
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
  aspect-ratio: 4/3;
  transition: opacity 0.15s;
}
.fi-picker__grid-item:hover { opacity: 0.8; }

.fi-picker__grid-thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fi-picker__actions {
  display: flex;
  gap: var(--mp-s2);
}

.fi-picker__file-input {
  display: none;
}
</style>
