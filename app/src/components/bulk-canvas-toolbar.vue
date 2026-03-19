<script setup lang="ts">
import { ref } from 'vue'
import MpButton from './ui/MpButton.vue'
import ImagePicker from './ImagePicker.vue'

import MpInput from './ui/MpInput.vue'

import type { ExportPreset } from '../composables/use-bulk-canvas'

const props = defineProps<{
  templates: Array<{ id: string; name: string; brand: string; layout: string; size: string }>
  selectedTemplateId: string
  globalTitle: string
  exportPreset: ExportPreset
  itemCount: number
  selectedCount: number
  rendering: boolean
}>()

const emit = defineEmits<{
  'update:selectedTemplateId': [id: string]
  'update:globalTitle': [title: string]
  'update:exportPreset': [preset: ExportPreset]
  'add-files': [files: File[]]
  'add-url': [url: string]
  'toggle-select-all': []
  'download-selected': []
  'download-all': []
}>()

function updatePreset(key: keyof ExportPreset, value: string) {
  const num = parseInt(value) || 0
  emit('update:exportPreset', { ...props.exportPreset, [key]: num })
}

const isDragOver = ref(false)
const showImagePicker = ref(false)
const imagePickerUrl = ref('')

function onDrop(e: DragEvent) {
  isDragOver.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (files.length) emit('add-files', files)
}

function onFileInput(e: Event) {
  const input = e.target as HTMLInputElement
  const files = Array.from(input.files ?? []).filter(f => f.type.startsWith('image/'))
  if (files.length) emit('add-files', files)
  input.value = ''
}

function onImagePickerSelect(url: string) {
  imagePickerUrl.value = url
  showImagePicker.value = false
  if (url) emit('add-url', url)
}
</script>

<template>
  <aside class="toolbar">
    <h2 class="toolbar__title">Bulk Canvas</h2>

    <!-- Template selector -->
    <div class="toolbar__section">
      <label class="toolbar__label">Template</label>
      <select
        class="toolbar__select"
        :value="selectedTemplateId"
        @change="emit('update:selectedTemplateId', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">-- Select --</option>
        <option v-for="t in templates" :key="t.id" :value="t.id">
          {{ t.name }} ({{ t.brand }})
        </option>
      </select>
    </div>

    <!-- Global title for export filenames -->
    <div class="toolbar__section">
      <MpInput
        label="Export Name"
        :modelValue="globalTitle"
        placeholder="e.g. may-ep-nhua-servo"
        @update:modelValue="emit('update:globalTitle', $event)"
      />
    </div>

    <!-- Drop zone -->
    <div class="toolbar__section">
      <label class="toolbar__label">Add Images</label>
      <div
        class="toolbar__dropzone"
        :class="{ 'toolbar__dropzone--active': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave="isDragOver = false"
        @drop.prevent="onDrop"
      >
        <label class="toolbar__dropzone-inner">
          <input type="file" multiple accept="image/*" hidden @change="onFileInput" />
          <span v-if="isDragOver">Drop images here</span>
          <span v-else>Drop images or click to upload</span>
        </label>
      </div>
      <MpButton variant="ghost" size="sm" style="width:100%;margin-top:6px" @click="showImagePicker = true">
        Add from Library
      </MpButton>
    </div>

    <!-- Export preset -->
    <div class="toolbar__section">
      <label class="toolbar__label">Export Size</label>
      <div class="toolbar__row">
        <input
          type="number"
          class="toolbar__num"
          placeholder="W"
          :value="exportPreset.width || ''"
          @input="updatePreset('width', ($event.target as HTMLInputElement).value)"
        />
        <span class="toolbar__x">&times;</span>
        <input
          type="number"
          class="toolbar__num"
          placeholder="H"
          :value="exportPreset.height || ''"
          @input="updatePreset('height', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <label class="toolbar__label" style="margin-top:6px">Max File Size (KB)</label>
      <input
        type="number"
        class="toolbar__num toolbar__num--full"
        placeholder="0 = no limit (PNG)"
        :value="exportPreset.maxSizeKb || ''"
        @input="updatePreset('maxSizeKb', ($event.target as HTMLInputElement).value)"
      />
      <div class="toolbar__hint">
        {{ exportPreset.maxSizeKb ? 'JPEG, best quality under limit' : 'PNG, lossless' }}
        {{ exportPreset.width && exportPreset.height ? ` · ${exportPreset.width}×${exportPreset.height}` : ' · Original size' }}
      </div>
    </div>

    <!-- Actions -->
    <div v-if="itemCount > 0" class="toolbar__section">
      <div class="toolbar__badge">{{ itemCount }} item{{ itemCount !== 1 ? 's' : '' }}</div>

      <MpButton variant="ghost" size="sm" style="width:100%" @click="emit('toggle-select-all')">
        {{ selectedCount === itemCount ? 'Deselect All' : 'Select All' }}
      </MpButton>

      <MpButton
        v-if="selectedCount > 0"
        variant="primary"
        size="sm"
        style="width:100%;margin-top:6px"
        :disabled="rendering"
        @click="emit('download-selected')"
      >
        Download {{ selectedCount }} Selected (ZIP)
      </MpButton>

      <MpButton
        variant="primary"
        size="sm"
        style="width:100%;margin-top:6px"
        :disabled="rendering"
        @click="emit('download-all')"
      >
        Download All (ZIP)
      </MpButton>
    </div>

    <!-- Image picker modal (reused) -->
    <ImagePicker
      v-if="showImagePicker"
      :modelValue="imagePickerUrl"
      label=""
      @update:modelValue="onImagePickerSelect"
    />
  </aside>
</template>

<style scoped>
.toolbar {
  width: 280px;
  min-width: 280px;
  border-right: 1px solid var(--mp-rule, #e5e5e5);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  overflow-y: auto;
  background: var(--mp-bg, #fff);
}

.toolbar__title {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
}

.toolbar__section {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toolbar__label {
  font-size: 11px;
  font-family: var(--mp-font-mono, monospace);
  color: var(--mp-muted, #888);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.toolbar__select {
  appearance: none;
  width: 100%;
  background: var(--mp-bg2, #f5f5f5);
  border: 1px solid var(--mp-rule, #e5e5e5);
  border-radius: var(--mp-radius, 6px);
  padding: 8px 12px;
  font-size: 13px;
  color: var(--mp-ink, #333);
  cursor: pointer;
}

.toolbar__dropzone {
  border: 2px dashed var(--mp-rule, #ddd);
  border-radius: var(--mp-radius, 6px);
  transition: border-color 0.15s, background 0.15s;
}

.toolbar__dropzone--active {
  border-color: var(--mp-terra, #c75b39);
  background: rgba(199, 91, 57, 0.05);
}

.toolbar__dropzone-inner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  cursor: pointer;
  color: var(--mp-muted, #888);
  font-size: 13px;
  text-align: center;
}

.toolbar__badge {
  font-size: 12px;
  font-weight: 600;
  color: var(--mp-ink, #333);
  padding: 4px 0;
}

.toolbar__row {
  display: flex;
  align-items: center;
  gap: 4px;
}

.toolbar__x {
  color: var(--mp-muted, #999);
  font-size: 13px;
}

.toolbar__num {
  width: 70px;
  background: var(--mp-bg2, #f5f5f5);
  border: 1px solid var(--mp-rule, #e5e5e5);
  border-radius: var(--mp-radius, 6px);
  padding: 6px 8px;
  font-size: 13px;
  color: var(--mp-ink, #333);
  text-align: center;
}

.toolbar__num--full {
  width: 100%;
  text-align: left;
}

.toolbar__hint {
  font-size: 11px;
  color: var(--mp-muted, #999);
  margin-top: 4px;
}

@media (max-width: 768px) {
  .toolbar {
    width: 100%;
    min-width: unset;
    border-right: none;
    border-bottom: 1px solid var(--mp-rule, #e5e5e5);
    flex-direction: row;
    flex-wrap: wrap;
    gap: 1rem;
  }
  .toolbar__title { width: 100%; }
  .toolbar__section { flex: 1; min-width: 200px; }
}
</style>
