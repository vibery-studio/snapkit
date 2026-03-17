<script setup lang="ts">
import { ref, computed, onMounted, watch, watchEffect } from 'vue'
import { useBuilderStore } from '../stores/builder'
import { useBrands } from '../composables/use-brands'
import { useLayouts } from '../composables/use-layouts'
import { useSizes } from '../composables/use-sizes'
import { apiFetch } from '../api/client'
import type { BrandKit } from '../types'
import { snapdom } from '@zumer/snapdom'
import MpButton from '../components/ui/MpButton.vue'
import MpInput from '../components/ui/MpInput.vue'
// LayoutRenderer no longer used — preview is server-rendered via v-html
import BackgroundPicker from '../components/BackgroundPicker.vue'
import LogoPicker from '../components/LogoPicker.vue'
import ImagePicker from '../components/ImagePicker.vue'

interface Template {
  id: string
  name: string
  brand: string
  layout: string
  size: string
  params: Record<string, string>
}

const store = useBuilderStore()
const { brands, loading: brandsLoading, fetchBrands } = useBrands()
const { layouts, fetchLayouts } = useLayouts()
const { sizes, fetchSizes } = useSizes()

const templates = ref<Template[]>([])
// Restore from localStorage
const saved = JSON.parse(localStorage.getItem('snapkit-builder') || '{}')
const selectedBrandId = ref(saved.brandId || '')
const selectedTemplateId = ref(saved.templateId || '')
const brandDetail = ref<BrandKit | null>(null)

// Persist selections to localStorage
watch([selectedBrandId, selectedTemplateId], ([brandId, templateId]) => {
  localStorage.setItem('snapkit-builder', JSON.stringify({ brandId, templateId }))
})

// Filtered templates for selected brand
const brandTemplates = computed(() =>
  templates.value.filter(t => t.brand === selectedBrandId.value)
)

// Preview scale: fit the canvas inside the center column
const previewContainerRef = ref<HTMLElement | null>(null)
const previewScale = computed(() => {
  const size = store.selectedSize
  if (!size || !previewContainerRef.value) return 1
  const availW = previewContainerRef.value.clientWidth - 48
  const availH = previewContainerRef.value.clientHeight - 80
  return Math.min(availW / size.w, availH / size.h, 1)
})

// Shorthand helpers for params bound to store
function p(key: string) {
  return (store.params[key] as string) ?? ''
}
function sp(key: string, val: string) {
  store.setParam(key, val)
}

// Build render URL (for fullscreen/export)
function buildRenderUrl(): string {
  if (!store.selectedLayout || !store.selectedSize) return ''
  const params = new URLSearchParams()
  if (selectedTemplateId.value) {
    params.set('t', selectedTemplateId.value)
  } else {
    params.set('layout', store.selectedLayout.id)
    params.set('size', store.selectedSize.id)
  }
  for (const [k, v] of Object.entries(store.params)) {
    if (v) params.set(k.replace(/([A-Z])/g, '_$1').toLowerCase(), String(v))
  }
  return `/api/render?${params.toString()}`
}

// Inline HTML preview — fetches thumbnail HTML from server, debounced
const previewHtml = ref('')
let previewDebounce: ReturnType<typeof setTimeout> | null = null

watchEffect(() => {
  // Build URL for /render/html (inline, no page shell)
  if (!store.selectedLayout || !store.selectedSize) { previewHtml.value = ''; return }
  const params = new URLSearchParams()
  if (selectedTemplateId.value) {
    params.set('t', selectedTemplateId.value)
  } else {
    params.set('layout', store.selectedLayout.id)
    params.set('size', store.selectedSize.id)
  }
  for (const [k, v] of Object.entries(store.params)) {
    if (v) params.set(k.replace(/([A-Z])/g, '_$1').toLowerCase(), String(v))
  }
  const url = `/api/render/html?${params.toString()}`

  if (previewDebounce) clearTimeout(previewDebounce)
  previewDebounce = setTimeout(async () => {
    try {
      const res = await fetch(url)
      if (res.ok) previewHtml.value = await res.text()
    } catch { /* ignore */ }
  }, 300)
})

onMounted(async () => {
  await Promise.all([fetchBrands(), fetchLayouts(), fetchSizes()])
  const data = await apiFetch<Template[]>('/api/templates')
  templates.value = data
  // Use saved brand or default to first
  if (!selectedBrandId.value && brands.value.length) selectedBrandId.value = brands.value[0]!.id
  // Re-apply saved template after data is loaded
  if (selectedTemplateId.value) {
    applyTemplate(selectedTemplateId.value)
  }
})

// Track if we should skip brand defaults (when template is being applied)

// Load brand detail when brand changes — full reset
watch(selectedBrandId, async (id) => {
  if (!id) { brandDetail.value = null; return }
  selectedTemplateId.value = ''
  try {
    brandDetail.value = await apiFetch<BrandKit>(`/api/brands/${id}`)
    if (brandDetail.value) {
      store.setBrand(brandDetail.value)
      // Reset all params to brand defaults
      store.resetParams()
      const b = brandDetail.value
      sp('bgColor', b.colors.primary)
      sp('titleColor', b.colors.secondary)
      sp('subtitleColor', b.default_text_color || '#FFFFFF')
      sp('overlay', b.default_overlay || 'dark')
      sp('logo', b.logos[0]?.url || '')
      sp('bgImage', b.backgrounds[0]?.url || '')
    }
  } catch { brandDetail.value = null }
})

// Apply a template's settings to the builder
function applyTemplate(tplId: string) {
  if (!tplId) return
  const tpl = templates.value.find(t => t.id === tplId)
  if (!tpl) return

  const size = sizes.value.find(s => s.id === tpl.size)
  if (size) store.setSize(size)
  const layout = layouts.value.find(l => l.id === tpl.layout)
  if (layout) store.setLayout(layout, true)
  for (const [k, v] of Object.entries(tpl.params)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    store.setParam(key, v)
  }
}

watch(selectedTemplateId, applyTemplate)

function setLayout(id: string) {
  const l = layouts.value.find(l => l.id === id)
  if (l) store.setLayout(l)
}

function setSize(id: string) {
  const s = sizes.value.find(s => s.id === id)
  if (s) store.setSize(s)
}

// Actions - client-side PNG export using snapdom (must remove scale transform first)
const layoutRendererRef = ref<HTMLElement | null>(null)
const isExporting = ref(false)

// Open render in new tab for fullscreen preview/screenshot
function openFullscreen() {
  const url = buildRenderUrl()
  if (url) window.open(url, '_blank')
}

async function exportPng() {
  if (!store.selectedLayout || !store.selectedSize || isExporting.value) return

  // Find the #thumbnail element rendered via v-html
  const wrapper = layoutRendererRef.value
  const thumb = wrapper?.querySelector('#thumbnail') as HTMLElement
  if (!thumb) {
    alert('No element to export')
    return
  }

  isExporting.value = true
  try {
    // Wait for fonts + images (same pattern as vilab share-image)
    await document.fonts.ready
    const imgs = thumb.querySelectorAll('img')
    await Promise.all(Array.from(imgs).map(img => {
      if (img.complete) return Promise.resolve()
      return new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 5000) })
    }))

    // Remove scale transform from wrapper for clean capture
    const origT = wrapper!.style.transform
    wrapper!.style.transform = 'none'

    // Capture with snapdom at native resolution
    const result = await snapdom(thumb) as any
    const canvas = await result.toCanvas()
    const blob = await new Promise<Blob>((resolve) => canvas.toBlob((b: Blob) => resolve(b), 'image/png'))

    // Restore transform
    wrapper!.style.transform = origT

    // Download
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${store.params.title || 'thumbnail'}-${store.selectedSize.w}x${store.selectedSize.h}.png`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (e) {
    console.error('Export failed:', e)
    alert('Export failed. Please try again.')
  } finally {
    isExporting.value = false
  }
}

async function saveDesign() {
  if (!store.selectedLayout || !store.selectedSize) return
  await apiFetch('/api/designs', {
    method: 'POST',
    body: JSON.stringify({
      layout: store.selectedLayout.id,
      size: { preset: store.selectedSize.id, width: store.selectedSize.w, height: store.selectedSize.h },
      brand: selectedBrandId.value,
      params: store.params,
    }),
  })
  alert('Design saved!')
}

async function saveTemplate() {
  const name = prompt('Template name?')
  if (!name || !store.selectedLayout || !store.selectedSize) return
  await apiFetch('/api/templates', {
    method: 'POST',
    body: JSON.stringify({
      name,
      brand: selectedBrandId.value,
      layout: store.selectedLayout.id,
      size: store.selectedSize.id,
      params: store.params,
    }),
  })
  // Refresh templates
  const data = await apiFetch<Template[]>('/api/templates')
  templates.value = data
}

function exportMultiple() {
  const sizesToExport = sizes.value.filter(s =>
    store.selectedLayout?.categories.includes(s.category)
  )
  for (const size of sizesToExport) {
    const params = new URLSearchParams()
    if (store.selectedLayout) params.set('layout', store.selectedLayout.id)
    params.set('size', size.id) // Use size ID instead of raw dimensions
    for (const [k, v] of Object.entries(store.params)) params.set(k, String(v))
    window.open(`/api/render?${params.toString()}`, '_blank')
  }
}

// Design Template button: navigate to template manager
function goDesignTemplate() {
  window.location.href = '/templates'
}
</script>

<template>
  <div class="builder">
    <!-- LEFT PANEL -->
    <aside class="builder__left">
      <!-- Brand selector -->
      <div class="builder__section">
        <label class="builder__label">Brand</label>
        <select v-model="selectedBrandId" class="builder__select" :disabled="brandsLoading">
          <option value="">-- Select Brand --</option>
          <option v-for="b in brands" :key="b.id" :value="b.id">{{ b.name }}</option>
        </select>
      </div>

      <!-- Quick Start Template -->
      <div class="builder__section">
        <label class="builder__label">Quick Start Template</label>
        <select v-model="selectedTemplateId" class="builder__select">
          <option value="">-- Select Template --</option>
          <option v-for="t in brandTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <p v-if="selectedBrandId && !brandTemplates.length" class="builder__hint">No templates yet</p>
      </div>

      <!-- Size preset -->
      <div class="builder__section">
        <label class="builder__label">Size Preset</label>
        <select
          class="builder__select"
          :value="store.selectedSize?.id ?? ''"
          @change="setSize(($event.target as HTMLSelectElement).value)"
        >
          <option value="">-- Select Size --</option>
          <option v-for="s in sizes" :key="s.id" :value="s.id">
            {{ s.name }} ({{ s.w }}×{{ s.h }})
          </option>
        </select>
      </div>

      <!-- Layout -->
      <div class="builder__section">
        <label class="builder__label">Layout</label>
        <select
          class="builder__select"
          :value="store.selectedLayout?.id ?? ''"
          @change="setLayout(($event.target as HTMLSelectElement).value)"
        >
          <option value="">-- Select Layout --</option>
          <option v-for="l in layouts" :key="l.id" :value="l.id">{{ l.name }}</option>
        </select>
      </div>

      <!-- Design Template button -->
      <MpButton variant="ghost" size="sm" style="width:100%" @click="goDesignTemplate">
        Design Template
      </MpButton>
    </aside>

    <!-- CENTER: Live Preview -->
    <main class="builder__center" ref="previewContainerRef">
      <div class="builder__preview-outer">
        <div
          class="builder__preview-scaled"
          :style="{
            width: store.selectedSize ? `${store.selectedSize.w * previewScale}px` : '640px',
            height: store.selectedSize ? `${store.selectedSize.h * previewScale}px` : '360px',
          }"
        >
          <div v-if="previewHtml" ref="layoutRendererRef"
            :style="{
              transform: `scale(${previewScale})`,
              transformOrigin: 'top left',
              flexShrink: 0,
            }"
            v-html="previewHtml"
          />
          <div v-else class="builder__preview-placeholder">
            <span>Select layout &amp; size to preview</span>
          </div>
        </div>

        <!-- Action buttons below preview -->
        <div class="builder__actions">
          <MpButton variant="ghost" size="sm" @click="openFullscreen">Fullscreen</MpButton>
          <MpButton variant="ghost" size="sm" @click="exportPng" :disabled="isExporting">
            {{ isExporting ? 'Exporting...' : 'Download PNG' }}
          </MpButton>
          <MpButton variant="secondary" size="sm" @click="saveDesign">Save Design</MpButton>
          <MpButton variant="secondary" size="sm" @click="saveTemplate">Save Template</MpButton>
        </div>
        <MpButton variant="primary" size="sm" style="width:100%;margin-top:8px" @click="exportMultiple">
          Export Multiple Sizes
        </MpButton>
      </div>
    </main>

    <!-- RIGHT PANEL -->
    <aside class="builder__right">
      <!-- Background -->
      <div class="builder__section">
        <label class="builder__label">Background</label>
        <BackgroundPicker
          :brandBackgrounds="brandDetail?.backgrounds ?? []"
          :modelValue="p('bgImage') || p('bgColor')"
          @update:modelValue="(v) => {
            if (v.startsWith('#') || v.startsWith('rgb') || v.startsWith('hsl') || v.startsWith('linear-gradient') || v.startsWith('radial-gradient')) {
              sp('bgColor', v); sp('bgImage', '')
            } else {
              sp('bgImage', v); sp('bgColor', '')
            }
          }"
        />
      </div>

      <!-- Title + color -->
      <div class="builder__section">
        <label class="builder__label">Title</label>
        <div class="builder__text-row">
          <MpInput
            :modelValue="p('title')"
            @update:modelValue="sp('title', $event)"
            placeholder="Enter title"
          />
          <input
            type="color"
            :value="p('titleColor') || '#ffffff'"
            @input="sp('titleColor', ($event.target as HTMLInputElement).value)"
            class="builder__color-swatch"
            title="Title color"
          />
        </div>
      </div>

      <!-- Subtitle + color -->
      <div class="builder__section">
        <label class="builder__label">Subtitle</label>
        <div class="builder__text-row">
          <MpInput
            :modelValue="p('subtitle')"
            @update:modelValue="sp('subtitle', $event)"
            placeholder="Enter subtitle"
          />
          <input
            type="color"
            :value="p('subtitleColor') || '#ffffff'"
            @input="sp('subtitleColor', ($event.target as HTMLInputElement).value)"
            class="builder__color-swatch"
            title="Subtitle color"
          />
        </div>
      </div>

      <!-- Overlay -->
      <div class="builder__section">
        <label class="builder__label">Overlay</label>
        <select
          class="builder__select"
          :value="p('overlay') || 'none'"
          @change="sp('overlay', ($event.target as HTMLSelectElement).value)"
        >
          <option value="none">None</option>
          <option value="light">Light</option>
          <option value="medium">Medium</option>
          <option value="dark">Dark</option>
        </select>
      </div>

      <!-- Logo picker -->
      <div class="builder__section">
        <label class="builder__label">Logo</label>
        <LogoPicker
          :logos="brandDetail?.logos ?? []"
          :modelValue="p('logo')"
          :position="p('logoPosition') || 'bottom-right'"
          @update:modelValue="sp('logo', $event)"
          @update:position="sp('logoPosition', $event)"
        />
      </div>

      <!-- Feature Image -->
      <div class="builder__section">
        <ImagePicker
          label="Feature Image"
          :modelValue="p('featureImage')"
          @update:modelValue="sp('featureImage', $event)"
        />
      </div>
    </aside>
  </div>
</template>

<style scoped>
.builder {
  display: grid;
  grid-template-columns: 240px 1fr 300px;
  min-height: 100vh;
  background: var(--mp-bg);
}

.builder__left,
.builder__right {
  padding: var(--mp-s4);
  overflow-y: auto;
  height: 100vh;
  position: sticky;
  top: 0;
}

.builder__left {
  border-right: 1px solid var(--mp-rule);
}

.builder__right {
  border-left: 1px solid var(--mp-rule);
}

.builder__section {
  margin-bottom: var(--mp-s5);
}

.builder__label {
  display: block;
  font-family: var(--mp-font-mono);
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--mp-muted);
  margin-bottom: var(--mp-s2);
}

.builder__select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  background: var(--mp-bg);
  font-family: var(--mp-font-body);
  font-size: 13px;
  color: var(--mp-ink);
  cursor: pointer;
}

.builder__select:focus {
  outline: none;
  border-color: var(--mp-terra);
}

.builder__hint {
  font-size: 11px;
  color: var(--mp-muted);
  margin-top: var(--mp-s1);
}

/* Center */
.builder__center {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: var(--mp-s6) var(--mp-s5);
  overflow: hidden;
}

.builder__preview-outer {
  width: 100%;
  max-width: 760px;
}

.builder__preview-scaled {
  background: var(--mp-bg3);
  border-radius: var(--mp-radius-lg);
  overflow: hidden;
  position: relative;
}

.builder__preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--mp-font-mono);
  font-size: 13px;
  color: var(--mp-muted);
}

.builder__actions {
  display: flex;
  gap: var(--mp-s2);
  justify-content: flex-end;
  margin-top: var(--mp-s3);
}

/* Title / Subtitle row with inline color swatch */
.builder__text-row {
  display: flex;
  gap: var(--mp-s2);
  align-items: flex-end;
}

.builder__text-row > :first-child {
  flex: 1;
}

.builder__color-swatch {
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius-sm);
  cursor: pointer;
  padding: 2px;
  background: none;
}

@media (max-width: 960px) {
  .builder {
    grid-template-columns: 1fr;
  }
  .builder__left,
  .builder__right {
    height: auto;
    position: static;
    border: none;
    border-bottom: 1px solid var(--mp-rule);
  }
}
</style>
