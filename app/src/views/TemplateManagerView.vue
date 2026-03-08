<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useTemplatesStore, type Template } from '../stores/templates'
import { useBrandsStore } from '../stores/brands'
import TemplateCard from '../components/TemplateCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import MpButton from '../components/ui/MpButton.vue'
import MpInput from '../components/ui/MpInput.vue'
import ImagePicker from '../components/ImagePicker.vue'
import { apiFetch } from '../api/client'
import type { Layout, SizePreset } from '../types'

const tplStore = useTemplatesStore()
const brandStore = useBrandsStore()

// ── Available layouts + sizes (fetched from API) ─────────────────────────────
const layouts = ref<Layout[]>([])
const sizes = ref<SizePreset[]>([])

interface SizeApiResponse {
  sizes: Array<{ id: string; name: string; width: number; height: number; category: string }>
}

async function fetchMeta() {
  try {
    const [l, sRes] = await Promise.all([
      apiFetch<Layout[]>('/api/layouts'),
      apiFetch<SizeApiResponse>('/api/sizes'),
    ])
    layouts.value = l
    // Map API response (width/height) to client type (w/h)
    sizes.value = sRes.sizes.map(s => ({
      id: s.id,
      name: s.name,
      w: s.width,
      h: s.height,
      category: s.category as SizePreset['category'],
    }))
  } catch {
    // non-blocking — form selects will just be empty
  }
}

// ── Form state (create + edit) ────────────────────────────────────────────────
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formLayout = ref('')
const formSize = ref('')
const formBrand = ref('')
const formParams = ref<Record<string, string>>({})
const saving = ref(false)
const formError = ref('')

// Get selected layout's param definitions
const selectedLayoutParams = computed(() => {
  const layout = layouts.value.find(l => l.id === formLayout.value)
  return layout?.params ?? []
})

// When layout changes, reset params but keep common ones
// Skip on initial load when editing
const skipParamReset = ref(false)
watch(formLayout, () => {
  if (skipParamReset.value) {
    skipParamReset.value = false
    return
  }
  const newParams: Record<string, string> = {}
  selectedLayoutParams.value.forEach(p => {
    newParams[p.key] = formParams.value[p.key] ?? ''
  })
  formParams.value = newParams
})

function openCreate() {
  editingId.value = null
  formName.value = ''
  formLayout.value = layouts.value[0]?.id ?? ''
  formSize.value = sizes.value[0]?.id ?? ''
  formBrand.value = brandStore.brands[0]?.id ?? ''
  formParams.value = {}
  formError.value = ''
  showForm.value = true
}

function openEdit(tpl: Template) {
  editingId.value = tpl.id
  formName.value = tpl.name
  // Convert all param values to strings BEFORE setting layout (to avoid watch reset)
  const params: Record<string, string> = {}
  if (tpl.params) {
    for (const [k, v] of Object.entries(tpl.params)) {
      params[k] = String(v ?? '')
    }
  }
  formParams.value = params
  skipParamReset.value = true  // Skip the watch reset
  formLayout.value = tpl.layout
  formSize.value = tpl.size
  formBrand.value = tpl.brand
  formError.value = ''
  showForm.value = true
}

async function submitForm() {
  if (!formName.value.trim()) { formError.value = 'Name is required'; return }
  if (!formLayout.value) { formError.value = 'Select a layout'; return }
  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: formName.value.trim(),
      layout: formLayout.value,
      size: formSize.value,
      brand: formBrand.value,
      params: formParams.value,
    }
    console.log('Saving template with params:', formParams.value)
    if (editingId.value) {
      await tplStore.updateTemplate(editingId.value, payload)
    } else {
      await tplStore.createTemplate(payload)
    }
    showForm.value = false
    await tplStore.fetchTemplates()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

// ── Delete ────────────────────────────────────────────────────────────────────
const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

async function doDelete() {
  if (!confirmDeleteId.value) return
  deleting.value = true
  try {
    await tplStore.deleteTemplate(confirmDeleteId.value)
  } finally {
    deleting.value = false
    confirmDeleteId.value = null
  }
}

// ── Preview URL (live preview with current form values) ──────────────────────
const previewUrl = computed(() => {
  if (!formLayout.value || !formSize.value) return ''
  const params = new URLSearchParams()
  params.set('layout', formLayout.value)
  params.set('size', formSize.value)
  if (formBrand.value) params.set('brand', formBrand.value)
  Object.entries(formParams.value).forEach(([k, v]) => {
    if (v) params.set(k, v)
  })
  params.set('_ts', String(Date.now()))
  return `/api/render?${params.toString()}`
})

// Get selected size dimensions for scaling
const selectedSize = computed(() => {
  if (!Array.isArray(sizes.value)) return null
  return sizes.value.find(s => s.id === formSize.value)
})

// Measure container width dynamically
const previewContainerRef = ref<HTMLElement | null>(null)
const containerWidth = ref(500)

watch(showForm, async (open) => {
  if (open) {
    await nextTick()
    if (previewContainerRef.value) {
      containerWidth.value = previewContainerRef.value.offsetWidth
    }
  }
})

// Calculate scale to fit preview container
const previewScale = computed(() => {
  const size = selectedSize.value
  if (!size) return 0.4
  return Math.min(containerWidth.value / size.w, 1)
})

onMounted(async () => {
  await Promise.all([tplStore.fetchTemplates(), brandStore.fetchBrands(), fetchMeta()])
})
</script>

<template>
  <div class="tpl-mgr">
    <!-- Header -->
    <div class="tpl-mgr__header">
      <div>
        <h1 class="tpl-mgr__title">Templates</h1>
        <p class="tpl-mgr__subtitle">Ready-to-use layout + brand presets</p>
      </div>
      <MpButton @click="openCreate">+ New Template</MpButton>
    </div>

    <!-- States -->
    <div v-if="tplStore.loading" class="tpl-mgr__state">Loading templates…</div>
    <div v-else-if="tplStore.error" class="tpl-mgr__state tpl-mgr__state--err">{{ tplStore.error }}</div>

    <!-- Empty -->
    <div v-else-if="!tplStore.templates.length" class="tpl-mgr__empty">
      <p>No templates yet.</p>
      <MpButton variant="ghost" @click="openCreate">Create your first template</MpButton>
    </div>

    <!-- Grid -->
    <div v-else class="tpl-mgr__grid">
      <TemplateCard
        v-for="tpl in tplStore.templates"
        :key="tpl.id"
        :template="tpl"
        @edit="openEdit(tpl)"
        @delete="confirmDeleteId = tpl.id"
      />
    </div>

    <!-- ── Create / Edit form modal ────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showForm" class="tpl-mgr__overlay" @click.self="showForm = false">
        <div class="tpl-mgr__modal">
          <div class="tpl-mgr__modal-header">
            <h3 class="tpl-mgr__modal-title">{{ editingId ? 'Edit Template' : 'New Template' }}</h3>
            <div class="tpl-mgr__modal-actions">
              <MpButton variant="ghost" @click="showForm = false">Cancel</MpButton>
              <MpButton :loading="saving" @click="submitForm">
                {{ editingId ? 'Save' : 'Create' }}
              </MpButton>
            </div>
          </div>

          <div class="tpl-mgr__modal-body">
            <!-- Left: Form -->
            <div class="tpl-mgr__form-panel">
              <!-- Basic Info -->
              <div class="tpl-mgr__section">
                <div class="tpl-mgr__section-title">Basic Info</div>
                <MpInput
                  label="Template name"
                  :modelValue="formName"
                  @update:modelValue="formName = $event"
                  placeholder="e.g. Gaming Thumbnail"
                />
                <div class="tpl-mgr__row">
                  <div class="tpl-mgr__field">
                    <label class="tpl-mgr__label">Layout</label>
                    <select class="tpl-mgr__select" v-model="formLayout">
                      <option v-for="l in layouts" :key="l.id" :value="l.id">{{ l.name }}</option>
                    </select>
                  </div>
                  <div class="tpl-mgr__field">
                    <label class="tpl-mgr__label">Size</label>
                    <select class="tpl-mgr__select" v-model="formSize">
                      <option v-for="s in sizes" :key="s.id" :value="s.id">{{ s.name }}</option>
                    </select>
                  </div>
                  <div class="tpl-mgr__field">
                    <label class="tpl-mgr__label">Brand</label>
                    <select class="tpl-mgr__select" v-model="formBrand">
                      <option v-for="b in brandStore.brands" :key="b.id" :value="b.id">{{ b.name }}</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- Parameters -->
              <div v-if="selectedLayoutParams.length" class="tpl-mgr__section">
                <div class="tpl-mgr__section-title">Default Parameters</div>
                <div class="tpl-mgr__params-grid">
                  <div v-for="param in selectedLayoutParams" :key="param.key" class="tpl-mgr__param-field">
                    <label class="tpl-mgr__param-label">
                      {{ param.label || param.key }}
                      <span v-if="param.required" class="tpl-mgr__param-req">*</span>
                    </label>
                    <div v-if="param.type === 'color'" class="tpl-mgr__color-row">
                      <input type="color" v-model="formParams[param.key]" class="tpl-mgr__color-input" />
                      <input type="text" v-model="formParams[param.key]" class="tpl-mgr__color-text" placeholder="#000000" />
                    </div>
                    <ImagePicker
                      v-else-if="param.type === 'image'"
                      :modelValue="formParams[param.key] || ''"
                      @update:modelValue="formParams[param.key] = $event"
                    />
                    <input
                      v-else
                      type="text"
                      v-model="formParams[param.key]"
                      class="tpl-mgr__text-input"
                      :placeholder="param.label || param.key"
                    />
                  </div>
                </div>
              </div>

              <p v-if="formError" class="tpl-mgr__form-error">{{ formError }}</p>
            </div>

            <!-- Right: Preview -->
            <div class="tpl-mgr__preview-panel">
              <div class="tpl-mgr__section-title">Live Preview</div>
              <div
                ref="previewContainerRef"
                class="tpl-mgr__preview-container"
                :style="selectedSize ? { height: (selectedSize.h * previewScale) + 'px' } : { height: '300px' }"
              >
                <iframe
                  v-if="previewUrl && selectedSize"
                  :src="previewUrl"
                  class="tpl-mgr__preview-iframe"
                  :style="{
                    width: selectedSize.w + 'px',
                    height: selectedSize.h + 'px',
                    transform: `scale(${previewScale})`,
                  }"
                />
                <div v-else class="tpl-mgr__preview-placeholder">Select layout and size</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <ConfirmDialog
      v-if="confirmDeleteId"
      title="Delete template"
      message="Delete this template? This cannot be undone."
      confirm-label="Delete"
      :dangerous="true"
      @confirm="doDelete"
      @cancel="confirmDeleteId = null"
    />
  </div>
</template>

<style scoped>
.tpl-mgr {
  padding: var(--mp-s7);
  display: flex;
  flex-direction: column;
  gap: var(--mp-s6);
  max-width: 960px;
}

.tpl-mgr__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mp-s4);
}

.tpl-mgr__title {
  font-family: var(--mp-font-heading);
  font-size: 26px;
  color: var(--mp-ink);
  margin: 0 0 var(--mp-s1);
}

.tpl-mgr__subtitle {
  font-size: 13px;
  color: var(--mp-muted);
  margin: 0;
}

.tpl-mgr__state {
  font-size: 14px;
  color: var(--mp-muted);
}

.tpl-mgr__state--err {
  color: #c0392b;
}

.tpl-mgr__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mp-s4);
  padding: var(--mp-s9) 0;
  color: var(--mp-muted);
  font-size: 14px;
}

/* Template grid */
.tpl-mgr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--mp-s5);
}

/* Modal overlay */
.tpl-mgr__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.tpl-mgr__modal {
  background: var(--mp-bg);
  border-radius: var(--mp-radius);
  width: 90vw;
  max-width: 1200px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.tpl-mgr__modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--mp-s5) var(--mp-s6);
  border-bottom: 1px solid var(--mp-rule);
}

.tpl-mgr__modal-title {
  font-family: var(--mp-font-heading);
  font-size: 20px;
  color: var(--mp-ink);
  margin: 0;
}

.tpl-mgr__modal-actions {
  display: flex;
  gap: var(--mp-s3);
}

.tpl-mgr__modal-body {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--mp-s5);
  padding: var(--mp-s5) var(--mp-s6);
  overflow-y: auto;
  flex: 1;
}

.tpl-mgr__form-panel {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s5);
}

.tpl-mgr__preview-panel {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s3);
}

.tpl-mgr__section {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s3);
}

.tpl-mgr__section-title {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: var(--mp-s2);
  border-bottom: 1px solid var(--mp-rule);
}

.tpl-mgr__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--mp-s3);
}

/* Form fields */
.tpl-mgr__form {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s4);
}

.tpl-mgr__field {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.tpl-mgr__label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.tpl-mgr__select {
  background: var(--mp-bg2);
  border: 1px solid transparent;
  border-radius: var(--mp-radius);
  padding: 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  outline: none;
  width: 100%;
  cursor: pointer;
  transition: border-color 0.15s;
}

.tpl-mgr__select:focus {
  border-color: var(--mp-terra);
}

.tpl-mgr__form-error {
  font-size: 13px;
  color: #c0392b;
  margin: 0;
}

/* Params section */
.tpl-mgr__params-section {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s2);
  padding-top: var(--mp-s3);
  border-top: 1px solid var(--mp-rule);
}

.tpl-mgr__params-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--mp-s3);
}

.tpl-mgr__param-field {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.tpl-mgr__param-label {
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
}

.tpl-mgr__param-req {
  color: #c0392b;
}

.tpl-mgr__color-row {
  display: flex;
  gap: var(--mp-s2);
}

.tpl-mgr__color-input {
  width: 44px;
  height: 36px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  cursor: pointer;
  flex-shrink: 0;
}

.tpl-mgr__color-text {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  font-size: 12px;
  font-family: var(--mp-font-mono);
  background: var(--mp-bg2);
  color: var(--mp-ink);
}

.tpl-mgr__text-input {
  padding: 8px 12px;
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  font-size: 13px;
  background: var(--mp-bg2);
  color: var(--mp-ink);
}

/* Preview - iframe renders at actual size, then scaled down to fit */
.tpl-mgr__preview-container {
  background: #111;
  border-radius: var(--mp-radius);
  width: 100%;
  overflow: hidden;
  position: relative;
}

.tpl-mgr__preview-iframe {
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  transform-origin: top left;
  pointer-events: none;
}

.tpl-mgr__preview-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--mp-muted);
  font-size: 13px;
}


@media (max-width: 640px) {
  .tpl-mgr {
    padding: var(--mp-s5);
  }

  .tpl-mgr__grid {
    grid-template-columns: 1fr;
  }

  .tpl-mgr__header {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
