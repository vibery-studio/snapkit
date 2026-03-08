<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useBrandsStore } from '../stores/brands'
import type { BrandKit } from '../types'
import BrandCard from '../components/BrandCard.vue'
import ConfirmDialog from '../components/ConfirmDialog.vue'
import FileUpload from '../components/FileUpload.vue'
import MpButton from '../components/ui/MpButton.vue'
import MpInput from '../components/ui/MpInput.vue'
import MpCard from '../components/ui/MpCard.vue'
import MpSearchSelect from '../components/ui/MpSearchSelect.vue'
import { FONT_OPTIONS } from '../data/google-fonts'

const route = useRoute()
const router = useRouter()
const store = useBrandsStore()

// Sync URL with selected brand
watch(() => store.selectedId, (id) => {
  if (id && route.params.id !== id) {
    router.replace(`/manage/brands/${id}`)
  }
})

watch(() => route.params.id, async (id) => {
  if (id && typeof id === 'string' && store.selectedId !== id) {
    store.selectedId = id
    await store.fetchBrandDetail(id)
  }
}, { immediate: true })

// ── New brand modal ──────────────────────────────────────────────────────────
const showNewModal = ref(false)
const newName = ref('')
const newSlug = ref('')
const creating = ref(false)

function autoSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function onNewNameInput(val: string) {
  newName.value = val
  newSlug.value = autoSlug(val)
}

async function submitCreate() {
  if (!newName.value.trim()) return
  creating.value = true
  try {
    const brand = await store.createBrand({ name: newName.value.trim(), slug: newSlug.value })
    store.selectedId = brand.id
    showNewModal.value = false
    newName.value = ''
    newSlug.value = ''
  } finally {
    creating.value = false
  }
}

// ── Delete brand ─────────────────────────────────────────────────────────────
const confirmDeleteBrand = ref(false)
const deleting = ref(false)

async function doDeleteBrand() {
  if (!store.selectedId) return
  deleting.value = true
  try {
    await store.deleteBrand(store.selectedId)
  } finally {
    deleting.value = false
    confirmDeleteBrand.value = false
  }
}

// ── Edit meta form ───────────────────────────────────────────────────────────
const editName = ref('')
const editColors = ref({ primary: '', secondary: '', accent: '', text_light: '', text_dark: '' })
const editFonts = ref({ heading: '', body: '' })
const saving = ref(false)

// Sync form when selection changes
const selectedBrand = computed(() => store.selected)

function loadForm(brand: BrandKit | null) {
  if (!brand) return
  editName.value = brand.name
  editColors.value = { ...brand.colors }
  editFonts.value = { ...brand.fonts }
}

// Watch selection
watch(selectedBrand, loadForm, { immediate: true })

async function saveMeta() {
  if (!store.selectedId) return
  saving.value = true
  try {
    await store.updateBrand(store.selectedId, {
      name: editName.value,
      colors: editColors.value,
      fonts: editFonts.value,
    })
  } finally {
    saving.value = false
  }
}

// ── Logo upload/delete ───────────────────────────────────────────────────────
const uploadingLogo = ref(false)
const confirmDeleteLogo = ref<string | null>(null)

async function onLogoUpload(file: File) {
  if (!store.selectedId) return
  uploadingLogo.value = true
  try { await store.uploadLogo(store.selectedId, file) }
  finally { uploadingLogo.value = false }
}

async function doDeleteLogo() {
  if (!store.selectedId || !confirmDeleteLogo.value) return
  await store.deleteLogo(store.selectedId, confirmDeleteLogo.value)
  confirmDeleteLogo.value = null
}

// ── Background upload/delete ─────────────────────────────────────────────────
const uploadingBg = ref(false)
const confirmDeleteBg = ref<string | null>(null)

async function onBgUpload(file: File) {
  if (!store.selectedId) return
  uploadingBg.value = true
  try { await store.uploadBg(store.selectedId, file) }
  finally { uploadingBg.value = false }
}

async function doDeleteBg() {
  if (!store.selectedId || !confirmDeleteBg.value) return
  await store.deleteBg(store.selectedId, confirmDeleteBg.value)
  confirmDeleteBg.value = null
}

// ── Watermark upload ─────────────────────────────────────────────────────────
const uploadingWm = ref(false)

async function onWatermarkUpload(file: File) {
  if (!store.selectedId) return
  uploadingWm.value = true
  try { await store.uploadWatermark(store.selectedId, file) }
  finally { uploadingWm.value = false }
}

onMounted(async () => {
  await store.fetchBrands()
  // Set initial selection from URL
  const id = route.params.id
  if (id && typeof id === 'string') {
    store.selectedId = id
    await store.fetchBrandDetail(id)
  } else if (store.brands.length && !store.selectedId) {
    const firstBrand = store.brands[0]
    if (firstBrand) {
      store.selectedId = firstBrand.id
      await store.fetchBrandDetail(firstBrand.id)
      router.replace(`/manage/brands/${firstBrand.id}`)
    }
  }
})
</script>

<template>
  <div class="brand-mgr">
    <!-- ── Sidebar ─────────────────────────────────────────────────────────── -->
    <aside class="brand-mgr__sidebar">
      <div class="brand-mgr__sidebar-head">
        <span class="brand-mgr__sidebar-title">Brands</span>
        <MpButton size="sm" @click="showNewModal = true">+ New</MpButton>
      </div>

      <div v-if="store.loading" class="brand-mgr__state">Loading…</div>
      <div v-else-if="store.error" class="brand-mgr__state brand-mgr__state--err">{{ store.error }}</div>
      <div v-else-if="!store.brands.length" class="brand-mgr__state">No brands yet.</div>

      <div v-else class="brand-mgr__list">
        <BrandCard
          v-for="brand in store.brands"
          :key="brand.id"
          :brand="brand"
          :active="store.selectedId === brand.id"
          @select="store.selectedId = brand.id"
        />
      </div>
    </aside>

    <!-- ── Detail panel ───────────────────────────────────────────────────── -->
    <div class="brand-mgr__detail">
      <div v-if="!selectedBrand" class="brand-mgr__empty">
        <p>Select a brand to edit, or create a new one.</p>
      </div>

      <template v-else>
        <!-- Panel header -->
        <div class="brand-mgr__panel-head">
          <h2 class="brand-mgr__panel-title">{{ selectedBrand.name }}</h2>
          <MpButton variant="ghost" size="sm" @click="confirmDeleteBrand = true">Delete</MpButton>
        </div>

        <!-- Meta form -->
        <MpCard padding="md">
          <h3 class="brand-mgr__section-title">Identity</h3>
          <div class="brand-mgr__form-grid">
            <MpInput label="Brand name" :modelValue="editName" @update:modelValue="editName = $event" />
          </div>

          <h3 class="brand-mgr__section-title">Colors</h3>
          <div class="brand-mgr__color-grid">
            <div v-for="key in (Object.keys(editColors) as Array<keyof typeof editColors>)" :key="key" class="brand-mgr__color-field">
              <label class="brand-mgr__color-label">{{ key.replace(/_/g, ' ') }}</label>
              <div class="brand-mgr__color-row">
                <input type="color" class="brand-mgr__color-picker" :value="editColors[key]" @input="editColors[key] = ($event.target as HTMLInputElement).value" />
                <MpInput :modelValue="editColors[key]" @update:modelValue="editColors[key] = $event" placeholder="#000000" />
              </div>
            </div>
          </div>

          <h3 class="brand-mgr__section-title">Fonts</h3>
          <div class="brand-mgr__form-grid">
            <MpSearchSelect label="Heading font" :modelValue="editFonts.heading" @update:modelValue="editFonts.heading = $event" :options="FONT_OPTIONS" placeholder="Select heading font" />
            <MpSearchSelect label="Body font" :modelValue="editFonts.body" @update:modelValue="editFonts.body = $event" :options="FONT_OPTIONS" placeholder="Select body font" />
          </div>

          <div class="brand-mgr__save-row">
            <MpButton :loading="saving" @click="saveMeta">Save changes</MpButton>
          </div>
        </MpCard>

        <!-- Logos section -->
        <MpCard padding="md">
          <h3 class="brand-mgr__section-title">Logos</h3>
          <div class="brand-mgr__asset-grid">
            <div
              v-for="logo in selectedBrand.logos"
              :key="logo.id"
              class="brand-mgr__asset-item"
            >
              <img :src="logo.url" :alt="logo.name" class="brand-mgr__asset-img" />
              <button class="brand-mgr__asset-del" @click="confirmDeleteLogo = logo.id" title="Delete logo">×</button>
            </div>
          </div>
          <FileUpload accept="image/*" label="Upload logo (PNG, SVG)" :uploading="uploadingLogo" @upload="onLogoUpload" />
        </MpCard>

        <!-- Backgrounds section -->
        <MpCard padding="md">
          <h3 class="brand-mgr__section-title">Backgrounds</h3>
          <div class="brand-mgr__asset-grid">
            <div
              v-for="bg in selectedBrand.backgrounds"
              :key="bg.name"
              class="brand-mgr__asset-item"
            >
              <img :src="bg.url" :alt="bg.name" class="brand-mgr__asset-img" />
              <button class="brand-mgr__asset-del" @click="confirmDeleteBg = bg.name" title="Delete background">×</button>
            </div>
          </div>
          <FileUpload accept="image/*" label="Upload background" :uploading="uploadingBg" @upload="onBgUpload" />
        </MpCard>

        <!-- Watermark section -->
        <MpCard padding="md">
          <h3 class="brand-mgr__section-title">Watermark</h3>
          <div v-if="selectedBrand.watermark" class="brand-mgr__watermark-preview">
            <img :src="selectedBrand.watermark.url" alt="Watermark" class="brand-mgr__wm-img" />
            <span class="brand-mgr__wm-opacity">Opacity: {{ selectedBrand.watermark.default_opacity }}</span>
          </div>
          <FileUpload accept="image/*" label="Upload watermark (PNG)" :uploading="uploadingWm" @upload="onWatermarkUpload" />
        </MpCard>
      </template>
    </div>

    <!-- ── New brand modal ────────────────────────────────────────────────── -->
    <Teleport to="body">
      <div v-if="showNewModal" class="brand-mgr__modal-overlay" @click.self="showNewModal = false">
        <div class="brand-mgr__modal">
          <h3 class="brand-mgr__modal-title">New Brand</h3>
          <MpInput label="Brand name" :modelValue="newName" @update:modelValue="onNewNameInput" placeholder="Acme Corp" />
          <MpInput label="Slug" :modelValue="newSlug" @update:modelValue="newSlug = $event" placeholder="acme-corp" />
          <div class="brand-mgr__modal-actions">
            <MpButton variant="ghost" @click="showNewModal = false">Cancel</MpButton>
            <MpButton :loading="creating" :disabled="!newName.trim()" @click="submitCreate">Create</MpButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ── Confirm dialogs ────────────────────────────────────────────────── -->
    <ConfirmDialog
      v-if="confirmDeleteBrand"
      title="Delete brand"
      :message="`Delete &quot;${selectedBrand?.name}&quot;? This cannot be undone.`"
      confirm-label="Delete"
      :dangerous="true"
      @confirm="doDeleteBrand"
      @cancel="confirmDeleteBrand = false"
    />

    <ConfirmDialog
      v-if="confirmDeleteLogo"
      title="Delete logo"
      message="Remove this logo from the brand?"
      confirm-label="Delete"
      :dangerous="true"
      @confirm="doDeleteLogo"
      @cancel="confirmDeleteLogo = null"
    />

    <ConfirmDialog
      v-if="confirmDeleteBg"
      title="Delete background"
      message="Remove this background from the brand?"
      confirm-label="Delete"
      :dangerous="true"
      @confirm="doDeleteBg"
      @cancel="confirmDeleteBg = null"
    />
  </div>
</template>

<style scoped>
.brand-mgr {
  display: flex;
  min-height: 100vh;
  background: var(--mp-bg);
}

/* Sidebar */
.brand-mgr__sidebar {
  width: 220px;
  flex-shrink: 0;
  border-right: 1px solid var(--mp-rule);
  padding: var(--mp-s6) var(--mp-s4);
  display: flex;
  flex-direction: column;
  gap: var(--mp-s4);
  background: var(--mp-bg2);
}

.brand-mgr__sidebar-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-mgr__sidebar-title {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mp-muted);
}

.brand-mgr__list {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s2);
}

.brand-mgr__state {
  font-size: 13px;
  color: var(--mp-muted);
}

.brand-mgr__state--err {
  color: #c0392b;
}

/* Detail panel */
.brand-mgr__detail {
  flex: 1;
  padding: var(--mp-s7);
  display: flex;
  flex-direction: column;
  gap: var(--mp-s5);
  overflow-y: auto;
}

.brand-mgr__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: var(--mp-muted);
  font-size: 14px;
}

.brand-mgr__panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.brand-mgr__panel-title {
  font-family: var(--mp-font-heading);
  font-size: 22px;
  color: var(--mp-ink);
  margin: 0;
}

.brand-mgr__section-title {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--mp-muted);
  margin: var(--mp-s5) 0 var(--mp-s3);
}

.brand-mgr__section-title:first-child {
  margin-top: 0;
}

.brand-mgr__form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--mp-s4);
}

.brand-mgr__color-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: var(--mp-s4);
}

.brand-mgr__color-field {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.brand-mgr__color-label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-transform: capitalize;
}

.brand-mgr__color-row {
  display: flex;
  align-items: center;
  gap: var(--mp-s2);
}

.brand-mgr__color-picker {
  width: 36px;
  height: 36px;
  padding: 2px;
  border: 2px solid var(--mp-ink);
  border-radius: var(--mp-radius-sm, 4px);
  background: none;
  cursor: pointer;
  flex-shrink: 0;
  box-shadow: 0 0 0 1px var(--mp-bg);
}

.brand-mgr__save-row {
  display: flex;
  justify-content: flex-end;
  margin-top: var(--mp-s5);
}

/* Asset grid */
.brand-mgr__asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: var(--mp-s3);
  margin-bottom: var(--mp-s4);
}

.brand-mgr__asset-item {
  position: relative;
  border-radius: var(--mp-radius-sm, 4px);
  overflow: hidden;
  background: var(--mp-bg3);
  aspect-ratio: 1;
}

.brand-mgr__asset-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.brand-mgr__asset-del {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 20px;
  height: 20px;
  background: rgba(0,0,0,0.55);
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 14px;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s;
}

.brand-mgr__asset-item:hover .brand-mgr__asset-del {
  opacity: 1;
}

/* Watermark */
.brand-mgr__watermark-preview {
  display: flex;
  align-items: center;
  gap: var(--mp-s4);
  margin-bottom: var(--mp-s4);
}

.brand-mgr__wm-img {
  width: 80px;
  height: 80px;
  object-fit: contain;
  background: var(--mp-bg3);
  border-radius: var(--mp-radius-sm, 4px);
}

.brand-mgr__wm-opacity {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
}

/* New brand modal */
.brand-mgr__modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.brand-mgr__modal {
  background: var(--mp-bg);
  border-radius: var(--mp-radius);
  padding: var(--mp-s7);
  width: 380px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  gap: var(--mp-s4);
}

.brand-mgr__modal-title {
  font-family: var(--mp-font-heading);
  font-size: 18px;
  color: var(--mp-ink);
  margin: 0;
}

.brand-mgr__modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mp-s3);
  margin-top: var(--mp-s2);
}

/* Mobile */
@media (max-width: 640px) {
  .brand-mgr {
    flex-direction: column;
  }

  .brand-mgr__sidebar {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--mp-rule);
  }

  .brand-mgr__form-grid,
  .brand-mgr__color-grid {
    grid-template-columns: 1fr;
  }
}
</style>
