<script setup lang="ts">
import { ref } from 'vue'
import type { Layout, LayoutParam } from '../types'
import MpInput from './ui/MpInput.vue'
import MpButton from './ui/MpButton.vue'
import ImageSearchPanel from './ImageSearchPanel.vue'

// ParamEditor: renders dynamic form fields based on layout.params definition
const props = defineProps<{
  layout: Layout | null
  params: Record<string, string | boolean | number>
}>()

const emit = defineEmits<{
  'update:param': [key: string, value: string]
}>()

// Track which image param has its search panel open
const activeImageSearch = ref<string | null>(null)

function onTextInput(key: string, value: string) {
  emit('update:param', key, value)
}

function onColorInput(key: string, e: Event) {
  emit('update:param', key, (e.target as HTMLInputElement).value)
}

function onSelectChange(key: string, e: Event) {
  emit('update:param', key, (e.target as HTMLSelectElement).value)
}

function openImageSearch(key: string) {
  activeImageSearch.value = activeImageSearch.value === key ? null : key
}

function onImagePick(key: string, url: string) {
  emit('update:param', key, url)
  activeImageSearch.value = null
}

function paramValue(p: LayoutParam): string {
  const v = props.params[p.key]
  return v !== undefined ? String(v) : ''
}
</script>

<template>
  <div class="param-editor">
    <p v-if="!layout" class="param-editor__empty">Select a layout to see options.</p>

    <template v-else-if="layout.params.length === 0">
      <p class="param-editor__empty">This layout has no editable params.</p>
    </template>

    <template v-else>
      <div v-for="param in layout.params" :key="param.key" class="param-editor__field">

        <!-- Text param -->
        <MpInput
          v-if="param.type === 'text'"
          :label="param.label"
          :modelValue="paramValue(param)"
          :placeholder="param.label"
          @update:modelValue="onTextInput(param.key, $event)"
        />

        <!-- Color param -->
        <div v-else-if="param.type === 'color'" class="param-editor__color-wrap">
          <label class="param-editor__label">{{ param.label }}</label>
          <div class="param-editor__color-row">
            <input
              type="color"
              class="param-editor__color-input"
              :value="paramValue(param) || '#000000'"
              @input="onColorInput(param.key, $event)"
            />
            <span class="param-editor__color-hex">{{ paramValue(param) || '#000000' }}</span>
          </div>
        </div>

        <!-- Select param -->
        <div v-else-if="param.type === 'select'" class="param-editor__select-wrap">
          <label class="param-editor__label">{{ param.label }}</label>
          <div class="param-editor__select-rel">
            <select
              class="param-editor__select"
              :value="paramValue(param)"
              @change="onSelectChange(param.key, $event)"
            >
              <option v-for="opt in param.options" :key="opt" :value="opt">{{ opt }}</option>
            </select>
            <span class="param-editor__caret" aria-hidden="true">▾</span>
          </div>
        </div>

        <!-- Image param: URL input + search toggle -->
        <div v-else-if="param.type === 'image'" class="param-editor__image-wrap">
          <label class="param-editor__label">{{ param.label }}</label>
          <div class="param-editor__image-row">
            <MpInput
              :modelValue="paramValue(param)"
              placeholder="Paste image URL…"
              @update:modelValue="onTextInput(param.key, $event)"
            />
            <MpButton
              variant="ghost"
              size="sm"
              type="button"
              @click="openImageSearch(param.key)"
            >
              Search
            </MpButton>
          </div>

          <!-- Inline thumbnail preview -->
          <img
            v-if="paramValue(param)"
            :src="paramValue(param)"
            class="param-editor__image-preview"
            alt=""
          />

          <!-- Image search panel slides open below the field -->
          <ImageSearchPanel
            v-if="activeImageSearch === param.key"
            @pick="onImagePick(param.key, $event)"
          />
        </div>

      </div>
    </template>
  </div>
</template>

<style scoped>
.param-editor__empty {
  font-family: var(--mp-font-mono);
  font-size: 12px;
  color: var(--mp-muted);
  padding: var(--mp-s2) 0;
}

.param-editor__field {
  margin-bottom: var(--mp-s4);
}

.param-editor__label {
  display: block;
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--mp-s1);
}

/* Color */
.param-editor__color-row {
  display: flex;
  align-items: center;
  gap: var(--mp-s2);
}

.param-editor__color-input {
  width: 40px;
  height: 36px;
  padding: 2px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  cursor: pointer;
  background: var(--mp-bg2);
}

.param-editor__color-hex {
  font-family: var(--mp-font-mono);
  font-size: 12px;
  color: var(--mp-muted);
}

/* Select */
.param-editor__select-rel {
  position: relative;
}

.param-editor__select {
  appearance: none;
  width: 100%;
  background: var(--mp-bg2);
  border: 1px solid transparent;
  border-radius: var(--mp-radius);
  padding: 10px 32px 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  outline: none;
  cursor: pointer;
  transition: border-color 0.15s;
}

.param-editor__select:focus {
  border-color: var(--mp-terra);
}

.param-editor__caret {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--mp-muted);
  pointer-events: none;
  font-size: 12px;
}

/* Image */
.param-editor__image-row {
  display: flex;
  gap: var(--mp-s2);
  align-items: flex-end;
}

.param-editor__image-row > :first-child {
  flex: 1;
}

.param-editor__image-preview {
  display: block;
  margin-top: var(--mp-s2);
  width: 100%;
  max-height: 80px;
  object-fit: cover;
  border-radius: var(--mp-radius);
  border: 1px solid var(--mp-rule);
}
</style>
