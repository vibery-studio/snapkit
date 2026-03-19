<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useBulkCanvas } from '../composables/use-bulk-canvas'
import BulkCanvasToolbar from '../components/bulk-canvas-toolbar.vue'
import BulkCanvasGrid from '../components/bulk-canvas-grid.vue'
import BulkCanvasItemEditor from '../components/bulk-canvas-item-editor.vue'

const canvas = useBulkCanvas()
const downloading = ref(false)

onMounted(() => canvas.loadTemplates())

// --- Download helpers (snapdom + jszip) ---

async function captureItem(id: string): Promise<{ name: string; blob: Blob } | null> {
  const card = document.querySelector(`[data-bulk-id="${id}"]`) as HTMLElement
  if (!card) return null

  const thumb = card.querySelector('#thumbnail') as HTMLElement
  if (!thumb) return null

  // Temporarily remove scale + overflow for clean full-size capture
  const scaleEl = card.querySelector('[data-bulk-scale]') as HTMLElement
  const origTransform = scaleEl?.style.transform ?? ''
  const origCardOverflow = card.style.overflow
  const origCardPos = card.style.position
  if (scaleEl) scaleEl.style.transform = 'none'
  card.style.overflow = 'visible'
  card.style.position = 'relative'

  // Wait for fonts + images
  await document.fonts.ready
  const imgs = thumb.querySelectorAll('img')
  await Promise.all(Array.from(imgs).map(img => {
    if (img.complete) return Promise.resolve()
    return new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 5000) })
  }))

  const { snapdom } = await import('@zumer/snapdom')
  const result = await snapdom(thumb) as any
  const c = await result.toCanvas()
  const blob = await new Promise<Blob>(r => c.toBlob((b: Blob) => r(b), 'image/png'))

  // Restore
  if (scaleEl) scaleEl.style.transform = origTransform
  card.style.overflow = origCardOverflow
  card.style.position = origCardPos

  const item = canvas.items.value.find(i => i.id === id)
  const name = (item?.title || 'banner').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').trim().substring(0, 50)
  return { name: `${name}-${id}.png`, blob }
}

async function downloadZip(ids: string[]) {
  downloading.value = true
  try {
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    for (const id of ids) {
      const result = await captureItem(id)
      if (result) zip.file(result.name, result.blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `banners-${canvas.selectedTemplate.value?.name || 'bulk'}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Download failed:', e)
    alert('Download failed')
  } finally {
    downloading.value = false
  }
}

function downloadSelected() {
  const ids = canvas.selectedItems.value.map(i => i.id)
  if (ids.length) downloadZip(ids)
}

function downloadAll() {
  const ids = canvas.items.value.map(i => i.id)
  if (ids.length) downloadZip(ids)
}

// Global drop handler for the entire view
const isDragOverView = ref(false)

function onViewDrop(e: DragEvent) {
  isDragOverView.value = false
  const files = Array.from(e.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'))
  if (files.length) canvas.addImages(files)
}
</script>

<template>
  <div
    class="bulk-canvas"
    @dragover.prevent="isDragOverView = true"
    @dragleave.self="isDragOverView = false"
    @drop.prevent="onViewDrop"
  >
    <BulkCanvasToolbar
      :templates="canvas.templates.value"
      :selectedTemplateId="canvas.selectedTemplateId.value"
      :itemCount="canvas.items.value.length"
      :selectedCount="canvas.selectedItems.value.length"
      :rendering="canvas.renderQueue.value > 0 || downloading"
      @update:selectedTemplateId="canvas.selectedTemplateId.value = $event"
      @add-files="canvas.addImages($event)"
      @add-url="canvas.addImageUrls([$event])"
      @toggle-select-all="canvas.toggleSelectAll()"
      @download-selected="downloadSelected"
      @download-all="downloadAll"
    />

    <BulkCanvasGrid
      :items="canvas.items.value"
      @toggle-select="canvas.toggleItem($event)"
      @edit="canvas.openEditor($event)"
      @remove="canvas.removeItem($event)"
    />

    <BulkCanvasItemEditor
      v-if="canvas.editingItem.value"
      :item="canvas.editingItem.value"
      :templateId="canvas.selectedTemplateId.value"
      @update-param="(id: string, key: string, val: string) => canvas.updateItemParam(id, key, val)"
      @close="canvas.closeEditor()"
    />

    <!-- Global drag overlay -->
    <div v-if="isDragOverView" class="bulk-canvas__drop-overlay">
      Drop images anywhere
    </div>
  </div>
</template>

<style scoped>
.bulk-canvas {
  display: flex;
  height: 100vh;
  position: relative;
  overflow: hidden;
}

.bulk-canvas__drop-overlay {
  position: absolute;
  inset: 0;
  background: rgba(199, 91, 57, 0.08);
  border: 3px dashed var(--mp-terra, #c75b39);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--mp-terra, #c75b39);
  z-index: 999;
  pointer-events: none;
}

@media (max-width: 768px) {
  .bulk-canvas {
    flex-direction: column;
    height: auto;
    min-height: 100vh;
  }
}
</style>
