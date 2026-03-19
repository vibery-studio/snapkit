<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import type { BulkCanvasItem } from '../composables/use-bulk-canvas'
import type { Layout } from '../types'
import MpInput from './ui/MpInput.vue'
import MpButton from './ui/MpButton.vue'
import ImagePicker from './ImagePicker.vue'
import ParamEditor from './ParamEditor.vue'
import { apiFetch } from '../api/client'
import { ref } from 'vue'

const props = defineProps<{
  item: BulkCanvasItem
  templateId: string
}>()

const emit = defineEmits<{
  'update-param': [id: string, key: string, value: string]
  'close': []
}>()

const layout = ref<Layout | null>(null)

// Fetch layout details for ParamEditor
async function fetchLayout() {
  if (!props.templateId) return
  try {
    const templates = await apiFetch<Array<{ id: string; layout: string }>>('/api/templates')
    const tpl = templates.find(t => t.id === props.templateId)
    if (!tpl) return
    const layouts = await apiFetch<Layout[]>('/api/layouts')
    layout.value = layouts.find(l => l.id === tpl.layout) ?? null
  } catch {
    layout.value = null
  }
}

// Merged params for ParamEditor (title/subtitle/feature_image + custom params)
const mergedParams = computed((): Record<string, string | boolean | number> => ({
  title: props.item.title,
  subtitle: props.item.subtitle,
  feature_image: props.item.featureImage,
  ...props.item.params,
}))

function onParamUpdate(key: string, value: string) {
  emit('update-param', props.item.id, key, value)
}

function onEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => {
  document.addEventListener('keydown', onEscape)
  fetchLayout()
})

onUnmounted(() => {
  document.removeEventListener('keydown', onEscape)
})
</script>

<template>
  <aside class="editor">
    <div class="editor__header">
      <h3 class="editor__title">Edit Item</h3>
      <MpButton variant="ghost" size="sm" @click="emit('close')">&times;</MpButton>
    </div>

    <div class="editor__body">
      <!-- Feature image -->
      <ImagePicker
        :modelValue="item.featureImage"
        label="Feature Image"
        @update:modelValue="onParamUpdate('feature_image', $event)"
      />

      <!-- File title (for export filename, not rendered in template) -->
      <MpInput
        label="File Title"
        :modelValue="item.fileTitle"
        placeholder="Override export filename"
        @update:modelValue="onParamUpdate('fileTitle', $event)"
      />

      <!-- Title / Subtitle -->
      <MpInput
        label="Title"
        :modelValue="item.title"
        placeholder="Title"
        @update:modelValue="onParamUpdate('title', $event)"
      />
      <MpInput
        label="Subtitle"
        :modelValue="item.subtitle"
        placeholder="Subtitle"
        @update:modelValue="onParamUpdate('subtitle', $event)"
      />

      <!-- Layout-specific params -->
      <ParamEditor
        v-if="layout"
        :layout="layout"
        :params="mergedParams"
        @update:param="onParamUpdate"
      />
    </div>
  </aside>
</template>

<style scoped>
.editor {
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: var(--mp-bg, #fff);
  border-left: 1px solid var(--mp-rule, #e5e5e5);
  box-shadow: -4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  animation: slide-in 0.2s ease-out;
}

@keyframes slide-in {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

.editor__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--mp-rule, #e5e5e5);
}

.editor__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.editor__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>
