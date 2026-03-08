<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBuilderStore } from '../stores/builder'
import { useBrands } from '../composables/use-brands'
import { useLayouts } from '../composables/use-layouts'
import { useSizes } from '../composables/use-sizes'
import { apiFetch } from '../api/client'
import type { BrandKit } from '../types'
import { snapdom } from '@zumer/snapdom'
import MpButton from '../components/ui/MpButton.vue'
import MpInput from '../components/ui/MpInput.vue'
import LayoutRenderer from '../components/LayoutRenderer.vue'
import BackgroundPicker from '../components/BackgroundPicker.vue'
import LogoPicker from '../components/LogoPicker.vue'
import FeatureImagePicker from '../components/FeatureImagePicker.vue'

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
const selectedBrandId = ref('')
const selectedTemplateId = ref('')
const brandDetail = ref<BrandKit | null>(null)

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
  const val = (store.params[key] as string) ?? ''
  if (key === 'featureImage') {
    console.log('p(featureImage) returning:', val ? val.substring(0, 100) + '...' : '(empty)')
  }
  return val
}
function sp(key: string, val: string) {
  console.log('sp called:', key, '=', typeof val === 'string' && val ? val.substring(0, 100) + '...' : '(empty or non-string)')
  store.setParam(key, val)
  console.log('store.params.featureImage after:', store.params.featureImage ? 'SET (length: ' + String(store.params.featureImage).length + ')' : 'NOT SET')
}

onMounted(async () => {
  await Promise.all([fetchBrands(), fetchLayouts(), fetchSizes()])
  const data = await apiFetch<{ templates: Template[] }>('/api/templates')
  templates.value = data.templates
  if (brands.value.length) selectedBrandId.value = brands.value[0]!.id
})

// Track if we should skip brand defaults (when template is being applied)
const skipBrandDefaults = ref(false)

// Load brand detail when brand changes
watch(selectedBrandId, async (id) => {
  if (!id) { brandDetail.value = null; return }
  try {
    brandDetail.value = await apiFetch<BrandKit>(`/api/brands/${id}`)
    if (brandDetail.value) {
      store.setBrand(brandDetail.value)
      // Only apply brand defaults if no template selected
      if (!skipBrandDefaults.value) {
        const b = brandDetail.value
        sp('bgColor', b.colors.primary)
        sp('titleColor', b.colors.secondary)
        sp('subtitleColor', b.default_text_color || '#FFFFFF')
        sp('overlay', b.default_overlay || 'dark')
        if (b.logos[0]) sp('logo', b.logos[0].url)
        if (b.backgrounds[0]) sp('bgImage', b.backgrounds[0].url)
      }
      skipBrandDefaults.value = false
    }
  } catch { brandDetail.value = null }
})

// Apply template preset - sets layout with preserveParams, then applies template params
watch(selectedTemplateId, (tplId) => {
  if (!tplId) return
  const tpl = templates.value.find(t => t.id === tplId)
  if (!tpl) return

  // Flag to skip brand defaults since template will override
  skipBrandDefaults.value = true

  const size = sizes.value.find(s => s.id === tpl.size)
  if (size) store.setSize(size)
  const layout = layouts.value.find(l => l.id === tpl.layout)
  if (layout) store.setLayout(layout, true) // preserve params
  // Apply ALL template params (overrides brand defaults)
  // Convert snake_case to camelCase for Builder compatibility
  for (const [k, v] of Object.entries(tpl.params)) {
    const key = k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    store.setParam(key, v)
  }
})

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
  const params = new URLSearchParams()

  // Use template endpoint if template selected, else inline params
  if (selectedTemplateId.value) {
    params.set('t', selectedTemplateId.value)
  } else {
    if (!store.selectedLayout || !store.selectedSize) return
    params.set('layout', store.selectedLayout.id)
    params.set('size', store.selectedSize.id)
  }

  // Add current param overrides (camelCase → snake_case)
  for (const [k, v] of Object.entries(store.params)) {
    if (v) params.set(k.replace(/([A-Z])/g, '_$1').toLowerCase(), String(v))
  }
  window.open(`/api/render?${params.toString()}`, '_blank')
}

async function exportPng() {
  if (!store.selectedLayout || !store.selectedSize || isExporting.value) return

  // Find the actual thumbnail element inside the layout renderer
  const wrapper = layoutRendererRef.value
  const thumb = wrapper?.querySelector('.layout-renderer') as HTMLElement
  if (!thumb) {
    alert('No element to export')
    return
  }

  isExporting.value = true
  try {
    // Wait for fonts
    await document.fonts.ready

    // Save and remove scale transform for clean capture
    const origT = thumb.style.transform
    const origO = thumb.style.transformOrigin
    thumb.style.transform = 'none'
    thumb.style.transformOrigin = ''

    // Capture with snapdom
    const result = await snapdom(thumb)
    const blob = await result.toBlob({ type: 'image/png', scale: 2 })

    // Restore transform
    thumb.style.transform = origT
    thumb.style.transformOrigin = origO

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
  const data = await apiFetch<{ templates: Template[] }>('/api/templates')
  templates.value = data.templates
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

      <!-- Quick Start Template -->
      <div class="builder__section">
        <label class="builder__label">Quick Start Template</label>
        <select v-model="selectedTemplateId" class="builder__select">
          <option value="">-- Select Template --</option>
          <option v-for="t in brandTemplates" :key="t.id" :value="t.id">{{ t.name }}</option>
        </select>
        <p v-if="selectedBrandId && !brandTemplates.length" class="builder__hint">No templates yet</p>
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
          <div v-if="store.selectedLayout && store.selectedSize" ref="layoutRendererRef">
            <LayoutRenderer
              :layoutId="store.selectedLayout.id"
              :width="store.selectedSize.w"
              :height="store.selectedSize.h"
              :scale="previewScale"
              :title="p('title')"
              :subtitle="p('subtitle')"
              :bgImage="p('bgImage')"
              :bgColor="p('bgColor')"
              :titleColor="p('titleColor')"
              :subtitleColor="p('subtitleColor')"
              :logo="p('logo')"
              :logoPosition="(p('logoPosition') || 'bottom-right') as any"
              :featureImage="p('featureImage')"
              :overlay="(p('overlay') || 'none') as any"
            />
          </div>
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
        <label class="builder__label">Feature Image</label>
        <FeatureImagePicker
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
