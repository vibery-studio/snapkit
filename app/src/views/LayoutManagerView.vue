<script setup lang="ts">
/**
 * LayoutManagerView - Create/edit custom HTML layouts with {{param}} placeholders
 */
import { ref, computed, onMounted } from 'vue'
import { apiFetch } from '../api/client'
import MpButton from '../components/ui/MpButton.vue'
import MpInput from '../components/ui/MpInput.vue'
import MpCard from '../components/ui/MpCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'

interface LayoutParam {
  key: string
  type: 'text' | 'color' | 'image' | 'select'
  label: string
  required?: boolean
  options?: string[] // for select type
}

interface Layout {
  id: string
  name: string
  categories: string[]
  params: LayoutParam[]
  custom: boolean
  html?: string
  css?: string
  created_at?: string
  updated_at?: string
}

const layouts = ref<Layout[]>([])
const loading = ref(false)
const error = ref('')

// Form state
const showForm = ref(false)
const editingId = ref<string | null>(null)
const formName = ref('')
const formCategories = ref<string[]>(['landscape'])
const formParams = ref<LayoutParam[]>([])
const formHtml = ref('')
const formCss = ref('')
const formError = ref('')
const saving = ref(false)

// Preview state
const previewWidth = ref(1200)
const previewHeight = ref(630)
const previewParams = ref<Record<string, string>>({})

// Delete state
const confirmDeleteId = ref<string | null>(null)
const deleting = ref(false)

const categoryOptions = ['landscape', 'square', 'portrait', 'wide']

async function fetchLayouts() {
  loading.value = true
  error.value = ''
  try {
    // Fetch all layouts (built-in + custom)
    const data = await apiFetch<Layout[]>('/api/layouts')
    layouts.value = data
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load layouts'
  } finally {
    loading.value = false
  }
}

function openCreate() {
  editingId.value = null
  formName.value = ''
  formCategories.value = ['landscape']
  formParams.value = []
  formHtml.value = `<div id="thumbnail" style="width:{{width}}px;height:{{height}}px;background:{{bg_color}};position:relative;">
  <h1 style="color:{{title_color}};font-size:48px;margin:40px;">{{title}}</h1>
  <p style="color:{{subtitle_color}};font-size:24px;margin:40px;">{{subtitle}}</p>
</div>`
  formCss.value = ''
  formError.value = ''
  previewParams.value = { title: 'Preview Title', subtitle: 'Preview Subtitle', bg_color: '#1a1a3e', title_color: '#FFD700', subtitle_color: '#FFFFFF' }
  showForm.value = true
}

async function openEdit(layout: Layout) {
  if (!layout.custom) {
    formError.value = 'Cannot edit built-in layouts'
    return
  }
  // Fetch full layout with HTML/CSS
  try {
    const full = await apiFetch<Layout>(`/api/layouts/${layout.id}`)
    editingId.value = layout.id
    formName.value = full.name
    formCategories.value = [...full.categories]
    formParams.value = JSON.parse(JSON.stringify(full.params))
    formHtml.value = full.html || ''
    formCss.value = full.css || ''
    formError.value = ''
    // Initialize preview params from layout params
    previewParams.value = {}
    full.params.forEach(p => {
      previewParams.value[p.key] = p.type === 'color' ? '#FFFFFF' : `Sample ${p.label}`
    })
    showForm.value = true
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Failed to load layout'
  }
}

// Duplicate built-in layout as a new custom layout
function duplicateBuiltIn(layout: Layout) {
  editingId.value = null
  formName.value = `${layout.name} (Copy)`
  formCategories.value = [...layout.categories]
  formParams.value = JSON.parse(JSON.stringify(layout.params))
  // Provide template HTML based on params
  const paramPlaceholders = layout.params.map(p => `  <!-- ${p.label}: {{${p.key}}} -->`).join('\n')
  formHtml.value = `<div id="thumbnail" style="position:relative;width:{{width}}px;height:{{height}}px;background:{{bg_color}};overflow:hidden;font-family:system-ui,sans-serif;">
${paramPlaceholders}
  <h1 style="margin:40px;color:{{title_color}};font-size:48px;">{{title}}</h1>
  <p style="margin:40px;color:{{subtitle_color}};font-size:24px;">{{subtitle}}</p>
</div>`
  formCss.value = ''
  formError.value = ''
  previewParams.value = {}
  layout.params.forEach(p => {
    previewParams.value[p.key] = p.type === 'color' ? '#1a1a3e' : `Sample ${p.label}`
  })
  showForm.value = true
}

function addParam() {
  formParams.value.push({ key: '', type: 'text', label: '', required: false })
}

function removeParam(index: number) {
  formParams.value.splice(index, 1)
}

// Extract params from HTML {{placeholders}}
function extractParamsFromHtml() {
  const matches = formHtml.value.match(/\{\{(\w+)\}\}/g) || []
  const keys = [...new Set(matches.map(m => m.replace(/[{}]/g, '')))]
  // Filter out reserved params
  const reserved = ['width', 'height']
  const userParams = keys.filter(k => !reserved.includes(k))

  // Add missing params
  userParams.forEach(key => {
    if (!formParams.value.find(p => p.key === key)) {
      const isColor = key.includes('color')
      const isImage = key.includes('image') || key.includes('logo') || key.includes('bg_image')
      formParams.value.push({
        key,
        type: isImage ? 'image' : isColor ? 'color' : 'text',
        label: key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
        required: ['title'].includes(key),
      })
    }
  })
}

async function submitForm() {
  if (!formName.value.trim()) { formError.value = 'Name is required'; return }
  if (!formHtml.value.trim()) { formError.value = 'HTML is required'; return }
  if (!formCategories.value.length) { formError.value = 'Select at least one category'; return }

  saving.value = true
  formError.value = ''
  try {
    const payload = {
      name: formName.value.trim(),
      categories: formCategories.value,
      params: formParams.value.filter(p => p.key.trim()),
      html: formHtml.value,
      css: formCss.value,
    }

    if (editingId.value) {
      await apiFetch(`/api/layouts/${editingId.value}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      })
    } else {
      await apiFetch('/api/layouts', {
        method: 'POST',
        body: JSON.stringify(payload),
      })
    }
    showForm.value = false
    await fetchLayouts()
  } catch (err) {
    formError.value = err instanceof Error ? err.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

async function doDelete() {
  if (!confirmDeleteId.value) return
  deleting.value = true
  try {
    await apiFetch(`/api/layouts/${confirmDeleteId.value}`, { method: 'DELETE' })
    await fetchLayouts()
  } finally {
    deleting.value = false
    confirmDeleteId.value = null
  }
}

// Generate preview HTML by replacing placeholders
const previewHtml = computed(() => {
  if (!formHtml.value) return ''
  let html = formHtml.value
  // Replace {{width}} and {{height}}
  html = html.replace(/\{\{width\}\}/g, String(previewWidth.value))
  html = html.replace(/\{\{height\}\}/g, String(previewHeight.value))
  // Replace param placeholders
  Object.entries(previewParams.value).forEach(([key, val]) => {
    html = html.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), val || '')
  })
  // Wrap with style if CSS provided
  if (formCss.value?.trim()) {
    html = `<style>${formCss.value}</style>${html}`
  }
  return html
})

onMounted(fetchLayouts)
</script>

<template>
  <div class="layout-mgr">
    <!-- Header -->
    <div class="layout-mgr__header">
      <div>
        <h1 class="layout-mgr__title">Custom Layouts</h1>
        <p class="layout-mgr__subtitle">Create HTML templates with {<!-- -->{param}} placeholders</p>
      </div>
      <MpButton @click="openCreate">+ New Layout</MpButton>
    </div>

    <!-- States -->
    <div v-if="loading" class="layout-mgr__state">Loading layouts…</div>
    <div v-else-if="error" class="layout-mgr__state layout-mgr__state--err">{{ error }}</div>

    <!-- Empty -->
    <div v-else-if="!layouts.length" class="layout-mgr__empty">
      <p>No custom layouts yet.</p>
      <MpButton variant="ghost" @click="openCreate">Create your first layout</MpButton>
    </div>

    <!-- Grid -->
    <div v-else class="layout-mgr__grid">
      <div
        v-for="layout in layouts"
        :key="layout.id"
        class="layout-mgr__card"
        :class="{ 'layout-mgr__card--builtin': !layout.custom }"
      >
        <div class="layout-mgr__card-header">
          <span class="layout-mgr__card-name">{{ layout.name }}</span>
          <span v-if="!layout.custom" class="layout-mgr__card-badge">Built-in</span>
        </div>
        <div class="layout-mgr__card-meta">
          <span>{{ layout.categories.join(', ') }}</span>
          <span>{{ layout.params.length }} params</span>
        </div>
        <div class="layout-mgr__card-actions">
          <template v-if="layout.custom">
            <MpButton variant="ghost" size="sm" @click="openEdit(layout)">Edit</MpButton>
            <MpButton variant="ghost" size="sm" @click="confirmDeleteId = layout.id">Delete</MpButton>
          </template>
          <MpButton v-else variant="ghost" size="sm" @click="duplicateBuiltIn(layout)">Duplicate</MpButton>
        </div>
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="layout-mgr__overlay" @click.self="showForm = false">
        <div class="layout-mgr__modal">
          <h3 class="layout-mgr__modal-title">{{ editingId ? 'Edit Layout' : 'New Layout' }}</h3>

          <div class="layout-mgr__modal-grid">
            <!-- Left: Form -->
            <div class="layout-mgr__form-col">
              <MpCard padding="md">
                <div class="layout-mgr__form">
                  <MpInput
                    label="Layout name"
                    :modelValue="formName"
                    @update:modelValue="formName = $event"
                    placeholder="e.g. My Custom Layout"
                  />

                  <!-- Categories -->
                  <div class="layout-mgr__field">
                    <label class="layout-mgr__label">Categories</label>
                    <div class="layout-mgr__checkboxes">
                      <label v-for="cat in categoryOptions" :key="cat" class="layout-mgr__checkbox">
                        <input
                          type="checkbox"
                          :value="cat"
                          v-model="formCategories"
                        />
                        {{ cat }}
                      </label>
                    </div>
                  </div>

                  <!-- HTML Editor -->
                  <div class="layout-mgr__field">
                    <div class="layout-mgr__label-row">
                      <label class="layout-mgr__label">HTML Code</label>
                      <MpButton variant="ghost" size="sm" @click="extractParamsFromHtml">
                        Extract Params
                      </MpButton>
                    </div>
                    <textarea
                      v-model="formHtml"
                      class="layout-mgr__code"
                      placeholder="<div id='thumbnail'>{{title}}</div>"
                      rows="12"
                    />
                  </div>

                  <!-- CSS Editor -->
                  <div class="layout-mgr__field">
                    <label class="layout-mgr__label">CSS (optional)</label>
                    <textarea
                      v-model="formCss"
                      class="layout-mgr__code"
                      placeholder="#thumbnail { ... }"
                      rows="4"
                    />
                  </div>

                  <!-- Params -->
                  <div class="layout-mgr__field">
                    <div class="layout-mgr__label-row">
                      <label class="layout-mgr__label">Parameters</label>
                      <MpButton variant="ghost" size="sm" @click="addParam">+ Add</MpButton>
                    </div>
                    <div v-if="!formParams.length" class="layout-mgr__params-empty">
                      No parameters defined. Use "Extract Params" to auto-detect from HTML.
                    </div>
                    <div v-for="(param, i) in formParams" :key="i" class="layout-mgr__param-row">
                      <input v-model="param.key" placeholder="key" class="layout-mgr__param-input" />
                      <select v-model="param.type" class="layout-mgr__param-select">
                        <option value="text">Text</option>
                        <option value="color">Color</option>
                        <option value="image">Image</option>
                        <option value="select">Select</option>
                      </select>
                      <input v-model="param.label" placeholder="Label" class="layout-mgr__param-input" />
                      <label class="layout-mgr__param-req">
                        <input type="checkbox" v-model="param.required" /> Req
                      </label>
                      <MpButton variant="ghost" size="sm" @click="removeParam(i)">×</MpButton>
                    </div>
                  </div>

                  <p v-if="formError" class="layout-mgr__form-error">{{ formError }}</p>
                </div>
              </MpCard>
            </div>

            <!-- Right: Preview -->
            <div class="layout-mgr__preview-col">
              <div class="layout-mgr__label">Live Preview</div>
              <div class="layout-mgr__preview-size">
                <input v-model.number="previewWidth" type="number" class="layout-mgr__size-input" /> ×
                <input v-model.number="previewHeight" type="number" class="layout-mgr__size-input" />
              </div>

              <!-- Preview params -->
              <div class="layout-mgr__preview-params">
                <div v-for="param in formParams" :key="param.key" class="layout-mgr__preview-param">
                  <label class="layout-mgr__preview-param-label">{{ param.label || param.key }}</label>
                  <input
                    v-if="param.type === 'color'"
                    type="color"
                    v-model="previewParams[param.key]"
                    class="layout-mgr__color-input"
                  />
                  <input
                    v-else
                    type="text"
                    v-model="previewParams[param.key]"
                    class="layout-mgr__text-input"
                    :placeholder="param.label"
                  />
                </div>
              </div>

              <div class="layout-mgr__preview-frame">
                <iframe
                  :srcdoc="previewHtml"
                  :style="{ width: previewWidth + 'px', height: previewHeight + 'px', transform: 'scale(0.4)', transformOrigin: 'top left' }"
                  class="layout-mgr__preview-iframe"
                />
              </div>
            </div>
          </div>

          <div class="layout-mgr__modal-actions">
            <MpButton variant="ghost" @click="showForm = false">Cancel</MpButton>
            <MpButton :loading="saving" @click="submitForm">
              {{ editingId ? 'Save changes' : 'Create' }}
            </MpButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Confirm delete -->
    <ConfirmDialog
      v-if="confirmDeleteId"
      title="Delete layout"
      message="Delete this custom layout? This cannot be undone."
      confirm-label="Delete"
      :dangerous="true"
      @confirm="doDelete"
      @cancel="confirmDeleteId = null"
    />
  </div>
</template>

<style scoped>
.layout-mgr {
  padding: var(--mp-s7);
  display: flex;
  flex-direction: column;
  gap: var(--mp-s6);
  max-width: 1200px;
}

.layout-mgr__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--mp-s4);
}

.layout-mgr__title {
  font-family: var(--mp-font-heading);
  font-size: 26px;
  color: var(--mp-ink);
  margin: 0 0 var(--mp-s1);
}

.layout-mgr__subtitle {
  font-size: 13px;
  color: var(--mp-muted);
  margin: 0;
}

.layout-mgr__state {
  font-size: 14px;
  color: var(--mp-muted);
}

.layout-mgr__state--err {
  color: #c0392b;
}

.layout-mgr__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mp-s4);
  padding: var(--mp-s9) 0;
  color: var(--mp-muted);
  font-size: 14px;
}

.layout-mgr__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--mp-s5);
}

.layout-mgr__card {
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
  padding: var(--mp-s4);
  border: 1px solid var(--mp-rule);
}

.layout-mgr__card--builtin {
  opacity: 0.7;
}

.layout-mgr__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--mp-s2);
}

.layout-mgr__card-name {
  font-weight: 600;
  color: var(--mp-ink);
}

.layout-mgr__card-badge {
  font-size: 10px;
  background: var(--mp-bg3);
  padding: 2px 6px;
  border-radius: 4px;
  color: var(--mp-muted);
}

.layout-mgr__card-meta {
  font-size: 12px;
  color: var(--mp-muted);
  display: flex;
  gap: var(--mp-s3);
  margin-bottom: var(--mp-s3);
}

.layout-mgr__card-actions {
  display: flex;
  gap: var(--mp-s2);
}

/* Modal */
.layout-mgr__overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  z-index: 1000;
  padding: var(--mp-s6);
  overflow-y: auto;
}

.layout-mgr__modal {
  background: var(--mp-bg);
  border-radius: var(--mp-radius);
  padding: var(--mp-s6);
  width: 100%;
  max-width: 1400px;
  display: flex;
  flex-direction: column;
  gap: var(--mp-s5);
}

.layout-mgr__modal-title {
  font-family: var(--mp-font-heading);
  font-size: 20px;
  color: var(--mp-ink);
  margin: 0;
}

.layout-mgr__modal-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--mp-s5);
}

.layout-mgr__form {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s4);
}

.layout-mgr__field {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.layout-mgr__label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.layout-mgr__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.layout-mgr__checkboxes {
  display: flex;
  gap: var(--mp-s4);
  flex-wrap: wrap;
}

.layout-mgr__checkbox {
  display: flex;
  align-items: center;
  gap: var(--mp-s1);
  font-size: 13px;
  color: var(--mp-ink);
  cursor: pointer;
}

.layout-mgr__code {
  font-family: var(--mp-font-mono);
  font-size: 12px;
  background: var(--mp-bg2);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  padding: var(--mp-s3);
  color: var(--mp-ink);
  resize: vertical;
  width: 100%;
}

.layout-mgr__params-empty {
  font-size: 12px;
  color: var(--mp-muted);
  padding: var(--mp-s3);
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
}

.layout-mgr__param-row {
  display: flex;
  align-items: center;
  gap: var(--mp-s2);
  padding: var(--mp-s2);
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
}

.layout-mgr__param-input {
  flex: 1;
  min-width: 80px;
  padding: 6px 8px;
  border: 1px solid var(--mp-rule);
  border-radius: 4px;
  font-size: 12px;
  background: var(--mp-bg);
  color: var(--mp-ink);
}

.layout-mgr__param-select {
  padding: 6px 8px;
  border: 1px solid var(--mp-rule);
  border-radius: 4px;
  font-size: 12px;
  background: var(--mp-bg);
  color: var(--mp-ink);
}

.layout-mgr__param-req {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--mp-muted);
  white-space: nowrap;
}

.layout-mgr__form-error {
  font-size: 13px;
  color: #c0392b;
  margin: 0;
}

/* Preview */
.layout-mgr__preview-col {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s3);
}

.layout-mgr__preview-size {
  display: flex;
  align-items: center;
  gap: var(--mp-s2);
  font-size: 12px;
  color: var(--mp-muted);
}

.layout-mgr__size-input {
  width: 70px;
  padding: 4px 8px;
  border: 1px solid var(--mp-rule);
  border-radius: 4px;
  font-size: 12px;
  background: var(--mp-bg2);
  color: var(--mp-ink);
}

.layout-mgr__preview-params {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s2);
  max-height: 200px;
  overflow-y: auto;
}

.layout-mgr__preview-param {
  display: flex;
  align-items: center;
  gap: var(--mp-s2);
}

.layout-mgr__preview-param-label {
  font-size: 11px;
  color: var(--mp-muted);
  width: 80px;
  flex-shrink: 0;
}

.layout-mgr__color-input {
  width: 40px;
  height: 28px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.layout-mgr__text-input {
  flex: 1;
  padding: 4px 8px;
  border: 1px solid var(--mp-rule);
  border-radius: 4px;
  font-size: 12px;
  background: var(--mp-bg2);
  color: var(--mp-ink);
}

.layout-mgr__preview-frame {
  background: var(--mp-bg2);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  overflow: hidden;
  height: 300px;
}

.layout-mgr__preview-iframe {
  border: none;
  display: block;
}

.layout-mgr__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mp-s3);
}

@media (max-width: 900px) {
  .layout-mgr__modal-grid {
    grid-template-columns: 1fr;
  }
}
</style>
