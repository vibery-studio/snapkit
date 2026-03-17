<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiFetch } from '../api/client'
import MpButton from '../components/ui/MpButton.vue'

interface Template {
  id: string; name: string; brand: string; layout: string; size: string
  params: Record<string, string>
}

interface BulkItem {
  title: string
  feature_image: string
}

const templates = ref<Template[]>([])
const selectedTemplateId = ref('')
const bulkText = ref('')
const previews = ref<string[]>([])
const loading = ref(false)
const templatePreviewHtml = ref('')

onMounted(async () => {
  templates.value = await apiFetch<Template[]>('/api/templates')
})

const selectedTemplate = computed(() =>
  templates.value.find(t => t.id === selectedTemplateId.value)
)

// Parse bulk text: each line = "title" or "title | image_url"
const parsedItems = computed((): BulkItem[] => {
  return bulkText.value
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => {
      const parts = line.split('|').map(s => s.trim())
      return { title: parts[0], feature_image: parts[1] || '' }
    })
})

// Template preview on selection
watch(selectedTemplateId, async (id) => {
  if (!id) { templatePreviewHtml.value = ''; return }
  try {
    const res = await fetch(`/api/render/html?t=${id}`)
    if (res.ok) templatePreviewHtml.value = await res.text()
  } catch { templatePreviewHtml.value = '' }
}, { immediate: true })

// Generate previews
async function generateBulk() {
  if (!selectedTemplateId.value || parsedItems.value.length === 0) return
  loading.value = true
  previews.value = []

  const results: string[] = []
  for (const item of parsedItems.value) {
    const params = new URLSearchParams()
    params.set('t', selectedTemplateId.value)
    params.set('title', item.title)
    if (item.feature_image) params.set('feature_image', item.feature_image)
    try {
      const res = await fetch(`/api/render/html?${params.toString()}`)
      results.push(res.ok ? await res.text() : '<div style="padding:2rem;color:red;">Error</div>')
    } catch {
      results.push('<div style="padding:2rem;color:red;">Failed</div>')
    }
  }
  previews.value = results
  loading.value = false
}

// Download single banner as PNG using snapdom
async function downloadOne(idx: number) {
  const cardEl = document.querySelector(`[data-bulk-idx="${idx}"] #thumbnail`) as HTMLElement
  if (!cardEl) return
  const { snapdom } = await import('@zumer/snapdom')
  const result = await snapdom(cardEl, { scale: 1 })
  const canvas = await result.toCanvas()
  const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'))
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${parsedItems.value[idx]?.title || 'banner'}-${idx + 1}.png`
  a.click()
  URL.revokeObjectURL(url)
}

// Download all banners as ZIP
const downloading = ref(false)
async function downloadAll() {
  if (!previews.value.length) return
  downloading.value = true
  try {
    const { snapdom } = await import('@zumer/snapdom')
    // Dynamic import JSZip
    const JSZip = (await import('jszip')).default
    const zip = new JSZip()

    for (let i = 0; i < previews.value.length; i++) {
      const el = document.querySelector(`[data-bulk-idx="${i}"] #thumbnail`) as HTMLElement
      if (!el) continue
      const result = await snapdom(el, { scale: 1 })
      const canvas = await result.toCanvas()
      const blob = await new Promise<Blob>(r => canvas.toBlob(b => r(b!), 'image/png'))
      const name = `${(parsedItems.value[i]?.title || 'banner').replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '').trim().substring(0, 50)}-${i + 1}.png`
      zip.file(name, blob)
    }

    const zipBlob = await zip.generateAsync({ type: 'blob' })
    const url = URL.createObjectURL(zipBlob)
    const a = document.createElement('a')
    a.href = url
    a.download = `banners-${selectedTemplate.value?.name || 'bulk'}.zip`
    a.click()
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Download all failed:', e)
    alert('Download failed')
  } finally {
    downloading.value = false
  }
}

// Reset previews when inputs change
watch([selectedTemplateId, bulkText], () => { previews.value = [] })
</script>

<template>
  <div class="bulk">
    <h1 class="bulk__title">Bulk Banner Creation</h1>

    <div class="bulk__top">
      <div class="bulk__controls">
        <div class="bulk__field">
          <label>Template</label>
          <select v-model="selectedTemplateId" class="bulk__select">
            <option value="">-- Select Template --</option>
            <option v-for="t in templates" :key="t.id" :value="t.id">{{ t.name }} ({{ t.brand }})</option>
          </select>
        </div>

        <div v-if="selectedTemplate" class="bulk__info">
          {{ selectedTemplate.layout }} &middot; {{ selectedTemplate.size }}
        </div>

        <div class="bulk__field">
          <label>Titles (one per line, optional: title | image_url)</label>
          <textarea
            v-model="bulkText"
            class="bulk__textarea"
            rows="8"
            placeholder="Robot Máy Ép Nhựa – Xu Hướng Tự Động Hóa
Máy Ép Nhựa Servo – Tiết Kiệm 60% Điện Năng
Dây Chuyền Sản Xuất Nhựa | https://example.com/img.jpg"
          />
        </div>

        <MpButton
          variant="primary"
          :disabled="!selectedTemplateId || parsedItems.length === 0 || loading"
          @click="generateBulk"
          style="width:100%"
        >
          {{ loading ? 'Generating...' : `Generate ${parsedItems.length} Banner${parsedItems.length !== 1 ? 's' : ''}` }}
        </MpButton>
      </div>

      <!-- Template preview (aspect-ratio container) -->
      <div v-if="templatePreviewHtml && !previews.length" class="bulk__template-preview">
        <div class="bulk__preview-aspect">
          <div class="bulk__preview-frame" v-html="templatePreviewHtml" />
        </div>
      </div>
    </div>

    <!-- Results grid -->
    <div v-if="previews.length" class="bulk__results">
      <div class="bulk__results-header">
        <h2>{{ previews.length }} Banners Generated</h2>
        <MpButton variant="primary" :disabled="downloading" @click="downloadAll">
          {{ downloading ? 'Zipping...' : 'Download All (ZIP)' }}
        </MpButton>
      </div>
      <div class="bulk__grid">
        <div
          v-for="(html, i) in previews"
          :key="i"
          class="bulk__card"
          :data-bulk-idx="i"
          @click="downloadOne(i)"
          title="Click to download PNG"
        >
          <div class="bulk__card-preview" v-html="html" />
          <div class="bulk__card-label">{{ parsedItems[i]?.title }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.bulk { padding: 2rem; max-width: 1200px; margin: 0 auto; }
.bulk__title { font-size: 1.5rem; font-weight: 700; margin-bottom: 1.5rem; }

.bulk__top { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
@media (max-width: 768px) { .bulk__top { grid-template-columns: 1fr; } }

.bulk__controls { display: flex; flex-direction: column; gap: 1rem; }
.bulk__field { display: flex; flex-direction: column; gap: 0.25rem; }
.bulk__field label { font-size: 0.8rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #555; }
.bulk__select { padding: 0.5rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; }
.bulk__textarea { padding: 0.75rem; border: 1px solid #ddd; border-radius: 6px; font-size: 0.85rem; font-family: monospace; resize: vertical; }
.bulk__info { font-size: 0.8rem; color: #888; }

.bulk__template-preview { border: 1px solid #eee; border-radius: 8px; overflow: hidden; background: #f5f5f5; align-self: start; }
.bulk__preview-aspect { display: flex; justify-content: center; }
.bulk__preview-frame { zoom: 0.4; pointer-events: none; }

.bulk__results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem; }
.bulk__results-header h2 { font-size: 1.1rem; color: #333; }
.bulk__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
.bulk__card { border: 1px solid #ddd; border-radius: 8px; overflow: hidden; cursor: pointer; transition: box-shadow 0.2s; position: relative; }
.bulk__card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.12); }
.bulk__card-preview { zoom: 0.28; pointer-events: none; }
.bulk__card-label { position: absolute; bottom: 0; left: 0; right: 0; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.75); color: #fff; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
</style>
