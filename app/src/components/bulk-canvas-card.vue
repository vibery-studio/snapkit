<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import type { BulkCanvasItem } from '../composables/use-bulk-canvas'

const props = defineProps<{
  item: BulkCanvasItem
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  'edit': [id: string]
  'remove': [id: string]
}>()

const renderRef = ref<HTMLElement | null>(null)
const scale = ref(0.25)
const innerW = ref(0)
const innerH = ref(0)

// Measure the #thumbnail inside rendered HTML to set proper container size
function measureThumbnail() {
  if (!renderRef.value) return
  const thumb = renderRef.value.querySelector('#thumbnail') as HTMLElement
  if (!thumb) return
  innerW.value = thumb.offsetWidth || 1080
  innerH.value = thumb.offsetHeight || 1080
}

watch(() => props.item.previewHtml, async () => {
  await nextTick()
  measureThumbnail()
})

onMounted(() => {
  nextTick(() => measureThumbnail())
})
</script>

<template>
  <div
    class="card"
    :class="{ 'card--selected': item.selected }"
    :data-bulk-id="item.id"
  >
    <!-- Checkbox -->
    <label class="card__check" @click.stop>
      <input
        type="checkbox"
        :checked="item.selected"
        @change="emit('toggle-select', item.id)"
      />
    </label>

    <!-- Remove button -->
    <button class="card__remove" @click.stop="emit('remove', item.id)" title="Remove">&times;</button>

    <!-- Preview area -->
    <div class="card__preview" @click="emit('edit', item.id)">
      <div v-if="item.loading" class="card__spinner">
        <div class="card__spinner-ring" />
      </div>
      <div
        v-else-if="item.previewHtml"
        ref="renderRef"
        class="card__render"
        :style="{
          width: innerW ? innerW * scale + 'px' : '100%',
          height: innerW ? innerH * scale + 'px' : 'auto',
        }"
      >
        <div
          class="card__render-inner"
          data-bulk-scale
          :style="{ transform: `scale(${scale})` }"
          v-html="item.previewHtml"
        />
      </div>
      <div v-else class="card__placeholder">
        <img :src="item.featureImage" class="card__thumb" />
      </div>
    </div>

    <!-- Label -->
    <div class="card__label">{{ item.fileTitle || item.title || 'Untitled' }}</div>
  </div>
</template>

<style scoped>
.card {
  position: relative;
  border: 2px solid var(--mp-rule, #e5e5e5);
  border-radius: var(--mp-radius, 8px);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.15s, box-shadow 0.15s;
  background: var(--mp-bg, #fff);
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card--selected {
  border-color: var(--mp-terra, #c75b39);
}

.card__check {
  position: absolute;
  top: 8px;
  left: 8px;
  z-index: 2;
  cursor: pointer;
}

.card__check input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: var(--mp-terra, #c75b39);
}

.card__remove {
  position: absolute;
  top: 4px;
  right: 4px;
  z-index: 2;
  width: 24px;
  height: 24px;
  border: none;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.card:hover .card__remove {
  opacity: 1;
}

.card__preview {
  overflow: hidden;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  background: var(--mp-bg2, #f5f5f5);
}

.card__render {
  overflow: hidden;
  position: relative;
}

.card__render-inner {
  transform-origin: top left;
  pointer-events: none;
  image-rendering: -webkit-optimize-contrast;
}

.card__placeholder {
  width: 100%;
  aspect-ratio: 1;
}

.card__thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card__spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
}

.card__spinner-ring {
  width: 32px;
  height: 32px;
  border: 3px solid var(--mp-rule, #ddd);
  border-top-color: var(--mp-terra, #c75b39);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.card__label {
  padding: 6px 10px;
  font-size: 12px;
  font-weight: 500;
  color: var(--mp-ink, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  border-top: 1px solid var(--mp-rule, #e5e5e5);
}
</style>
