<script setup lang="ts">
import { ref } from 'vue'
import MpInput from './ui/MpInput.vue'
import MpButton from './ui/MpButton.vue'
import { apiFetch } from '../api/client'

// Image search panel: inline search + results grid, emits picked URL
const emit = defineEmits<{
  pick: [url: string]
}>()

interface ImageResult {
  url: string
  thumb: string
  alt: string
  credit: string
}

const query = ref('')
const results = ref<ImageResult[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

async function search() {
  if (!query.value.trim()) return
  loading.value = true
  error.value = null
  try {
    const data = await apiFetch<ImageResult[]>(`/api/search/images?q=${encodeURIComponent(query.value)}`)
    results.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Search failed'
    results.value = []
  } finally {
    loading.value = false
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') search()
}

function pick(url: string) {
  emit('pick', url)
}
</script>

<template>
  <div class="img-search">
    <div class="img-search__bar">
      <MpInput
        v-model="query"
        placeholder="Search images…"
        @keydown="onKeydown"
      />
      <MpButton variant="secondary" size="sm" :loading="loading" @click="search">
        Go
      </MpButton>
    </div>

    <p v-if="error" class="img-search__error">{{ error }}</p>

    <p v-if="!loading && results.length === 0 && query" class="img-search__empty">
      No results for "{{ query }}"
    </p>

    <div v-if="results.length > 0" class="img-search__grid">
      <button
        v-for="(img, i) in results"
        :key="i"
        class="img-search__item"
        type="button"
        @click="pick(img.url)"
        :title="img.alt || img.credit"
      >
        <img :src="img.thumb" :alt="img.alt" class="img-search__thumb" loading="lazy" />
        <span v-if="img.credit" class="img-search__credit">{{ img.credit }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.img-search {
  margin-top: var(--mp-s3);
  background: var(--mp-bg2);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  padding: var(--mp-s3);
}

.img-search__bar {
  display: flex;
  gap: var(--mp-s2);
  align-items: flex-end;
  margin-bottom: var(--mp-s3);
}

.img-search__bar > :first-child {
  flex: 1;
}

.img-search__error {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: #c0392b;
  margin: 0 0 var(--mp-s2);
}

.img-search__empty {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  margin: 0;
}

.img-search__grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mp-s2);
  max-height: 220px;
  overflow-y: auto;
}

.img-search__item {
  position: relative;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  border-radius: var(--mp-radius-sm);
  overflow: hidden;
  aspect-ratio: 4 / 3;
  transition: opacity 0.15s;
}

.img-search__item:hover {
  opacity: 0.85;
}

.img-search__thumb {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.img-search__credit {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.45);
  color: #fff;
  font-family: var(--mp-font-mono);
  font-size: 9px;
  padding: 2px 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
