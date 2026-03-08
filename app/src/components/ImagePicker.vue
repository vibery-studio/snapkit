<script setup lang="ts">
/**
 * ImagePicker - unified image selection: Library, AI Search, Upload
 * Replaces FeatureImagePicker with media library integration
 */
import { ref, computed, onMounted } from 'vue'
import { useMediaStore, type MediaItem } from '../stores/media'
import MpButton from './ui/MpButton.vue'
import MpInput from './ui/MpInput.vue'
import { apiFetch } from '../api/client'

const props = defineProps<{
  modelValue: string
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [url: string]
}>()

const mediaStore = useMediaStore()

// UI state
const showModal = ref(false)
const activeTab = ref<'library' | 'search' | 'upload'>('library')
const searchQuery = ref('')
const searchResults = ref<Array<{ url: string; thumb: string; alt: string; width: number; height: number }>>([])
const searching = ref(false)
const uploading = ref(false)
const libraryQuery = ref('')

// Filtered library items
const filteredLibrary = computed(() => {
  if (!libraryQuery.value) return mediaStore.items
  const q = libraryQuery.value.toLowerCase()
  return mediaStore.items.filter(m =>
    m.name.toLowerCase().includes(q) ||
    m.tags.some(t => t.toLowerCase().includes(q))
  )
})

// Search Pexels
async function doSearch() {
  if (!searchQuery.value.trim()) return
  searching.value = true
  try {
    const res = await apiFetch<{ results: Array<{ url_thumb: string; url_full: string; alt: string; width: number; height: number }> }>(
      `/api/search/images?q=${encodeURIComponent(searchQuery.value)}&per_page=20`
    )
    searchResults.value = res.results.map(r => ({
      url: r.url_full,
      thumb: r.url_thumb,
      alt: r.alt,
      width: r.width,
      height: r.height,
    }))
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

// Select from search results - save to library first
async function selectFromSearch(item: { url: string; thumb: string; alt: string; width: number; height: number }) {
  const saved = await mediaStore.saveExternal({
    name: item.alt || 'Pexels image',
    url: item.url,
    thumb_url: item.thumb,
    source: 'pexels',
    width: item.width,
    height: item.height,
    tags: searchQuery.value ? [searchQuery.value] : [],
  })
  emit('update:modelValue', saved.url)
  showModal.value = false
}

// Select from library
function selectFromLibrary(item: MediaItem) {
  emit('update:modelValue', item.url)
  showModal.value = false
}

// Handle file upload
async function handleUpload(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    const item = await mediaStore.uploadFile(file)
    emit('update:modelValue', item.url)
    showModal.value = false
  } finally {
    uploading.value = false
    input.value = ''
  }
}

// Clear selection
function clear() {
  emit('update:modelValue', '')
}

// Open modal and load library
function openModal() {
  showModal.value = true
  if (!mediaStore.items.length) {
    mediaStore.fetchMedia()
  }
}

onMounted(() => {
  // Preload library in background
  if (!mediaStore.items.length) {
    mediaStore.fetchMedia()
  }
})
</script>

<template>
  <div class="image-picker">
    <label v-if="label" class="image-picker__label">{{ label }}</label>

    <!-- Preview / Select button -->
    <div class="image-picker__preview" @click="openModal">
      <img v-if="modelValue" :src="modelValue" class="image-picker__img" />
      <div v-else class="image-picker__placeholder">
        <span>Click to select image</span>
      </div>
    </div>

    <div v-if="modelValue" class="image-picker__actions">
      <MpButton variant="ghost" size="sm" @click="openModal">Change</MpButton>
      <MpButton variant="ghost" size="sm" @click="clear">Clear</MpButton>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="image-picker__overlay" @click.self="showModal = false">
        <div class="image-picker__modal">
          <div class="image-picker__modal-header">
            <h3>Select Image</h3>
            <MpButton variant="ghost" @click="showModal = false">×</MpButton>
          </div>

          <!-- Tabs -->
          <div class="image-picker__tabs">
            <button
              :class="['image-picker__tab', { active: activeTab === 'library' }]"
              @click="activeTab = 'library'"
            >Library</button>
            <button
              :class="['image-picker__tab', { active: activeTab === 'search' }]"
              @click="activeTab = 'search'"
            >AI Search</button>
            <button
              :class="['image-picker__tab', { active: activeTab === 'upload' }]"
              @click="activeTab = 'upload'"
            >Upload</button>
          </div>

          <div class="image-picker__content">
            <!-- Library Tab -->
            <div v-if="activeTab === 'library'" class="image-picker__library">
              <MpInput
                v-model="libraryQuery"
                placeholder="Filter by name or tag..."
                class="image-picker__search-input"
              />
              <div v-if="mediaStore.loading" class="image-picker__loading">Loading...</div>
              <div v-else-if="!filteredLibrary.length" class="image-picker__empty">
                No images in library. Upload or search to add some.
              </div>
              <div v-else class="image-picker__grid">
                <div
                  v-for="item in filteredLibrary"
                  :key="item.id"
                  class="image-picker__item"
                  @click="selectFromLibrary(item)"
                >
                  <img :src="item.thumb_url || item.url" :alt="item.name" />
                  <span class="image-picker__item-name">{{ item.name }}</span>
                </div>
              </div>
            </div>

            <!-- Search Tab -->
            <div v-if="activeTab === 'search'" class="image-picker__search">
              <div class="image-picker__search-bar">
                <MpInput
                  v-model="searchQuery"
                  placeholder="Search Pexels..."
                  @keyup.enter="doSearch"
                />
                <MpButton :loading="searching" @click="doSearch">Search</MpButton>
              </div>
              <div v-if="searchResults.length" class="image-picker__grid">
                <div
                  v-for="(item, i) in searchResults"
                  :key="i"
                  class="image-picker__item"
                  @click="selectFromSearch(item)"
                >
                  <img :src="item.thumb" :alt="item.alt" />
                </div>
              </div>
              <div v-else class="image-picker__empty">
                Search for images from Pexels
              </div>
            </div>

            <!-- Upload Tab -->
            <div v-if="activeTab === 'upload'" class="image-picker__upload">
              <label class="image-picker__upload-zone">
                <input type="file" accept="image/*" @change="handleUpload" hidden />
                <span v-if="uploading">Uploading...</span>
                <span v-else>Click or drag to upload</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.image-picker__label {
  display: block;
  font-size: 11px;
  font-family: var(--mp-font-mono);
  color: var(--mp-muted);
  text-transform: uppercase;
  margin-bottom: var(--mp-s1);
}

.image-picker__preview {
  width: 100%;
  aspect-ratio: 16/9;
  background: var(--mp-bg2);
  border: 1px dashed var(--mp-rule);
  border-radius: var(--mp-radius);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s;
}

.image-picker__preview:hover {
  border-color: var(--mp-terra);
}

.image-picker__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-picker__placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mp-muted);
  font-size: 13px;
}

.image-picker__actions {
  display: flex;
  gap: var(--mp-s2);
  margin-top: var(--mp-s2);
}

/* Modal */
.image-picker__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.image-picker__modal {
  background: var(--mp-bg);
  border-radius: var(--mp-radius);
  width: 90vw;
  max-width: 800px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.image-picker__modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mp-s4) var(--mp-s5);
  border-bottom: 1px solid var(--mp-rule);
}

.image-picker__modal-header h3 {
  margin: 0;
  font-size: 18px;
}

.image-picker__tabs {
  display: flex;
  border-bottom: 1px solid var(--mp-rule);
}

.image-picker__tab {
  flex: 1;
  padding: var(--mp-s3) var(--mp-s4);
  background: none;
  border: none;
  font-size: 13px;
  cursor: pointer;
  color: var(--mp-muted);
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
}

.image-picker__tab.active {
  color: var(--mp-terra);
  border-bottom-color: var(--mp-terra);
}

.image-picker__content {
  flex: 1;
  overflow-y: auto;
  padding: var(--mp-s4);
}

.image-picker__search-input {
  margin-bottom: var(--mp-s3);
}

.image-picker__search-bar {
  display: flex;
  gap: var(--mp-s2);
  margin-bottom: var(--mp-s4);
}

.image-picker__search-bar .mp-input {
  flex: 1;
}

.image-picker__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: var(--mp-s3);
}

.image-picker__item {
  aspect-ratio: 1;
  border-radius: var(--mp-radius);
  overflow: hidden;
  cursor: pointer;
  position: relative;
  border: 2px solid transparent;
  transition: border-color 0.15s;
}

.image-picker__item:hover {
  border-color: var(--mp-terra);
}

.image-picker__item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-picker__item-name {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 10px;
  padding: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.image-picker__loading,
.image-picker__empty {
  text-align: center;
  padding: var(--mp-s6);
  color: var(--mp-muted);
}

.image-picker__upload-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed var(--mp-rule);
  border-radius: var(--mp-radius);
  cursor: pointer;
  color: var(--mp-muted);
  transition: border-color 0.15s;
}

.image-picker__upload-zone:hover {
  border-color: var(--mp-terra);
}
</style>
