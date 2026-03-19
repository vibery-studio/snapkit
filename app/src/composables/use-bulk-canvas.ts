import { ref, computed, watch } from 'vue'
import { apiFetch } from '../api/client'
import { useMediaStore } from '../stores/media'

export interface BulkCanvasItem {
  id: string
  featureImage: string
  title: string
  subtitle: string
  params: Record<string, string>
  previewHtml: string
  selected: boolean
  loading: boolean
}

interface TemplateInfo {
  id: string
  name: string
  brand: string
  layout: string
  size: string
  params: Record<string, string>
}

let nextId = 1
function uid() { return `bulk-${nextId++}` }

export function useBulkCanvas() {
  const mediaStore = useMediaStore()

  const templates = ref<TemplateInfo[]>([])
  const selectedTemplateId = ref('')
  const items = ref<BulkCanvasItem[]>([])
  const editingItemId = ref<string | null>(null)
  const renderQueue = ref(0)

  // Fetch templates
  async function loadTemplates() {
    templates.value = await apiFetch<TemplateInfo[]>('/api/templates')
  }

  const selectedTemplate = computed(() =>
    templates.value.find(t => t.id === selectedTemplateId.value)
  )

  const editingItem = computed(() =>
    items.value.find(i => i.id === editingItemId.value) ?? null
  )

  const selectedItems = computed(() => items.value.filter(i => i.selected))

  // --- Item management ---

  function createItem(featureImage: string, title = ''): BulkCanvasItem {
    return {
      id: uid(),
      featureImage,
      title,
      subtitle: '',
      params: {},
      previewHtml: '',
      selected: true,
      loading: false,
    }
  }

  async function addImages(files: File[]) {
    const uploads = files.map(async (file) => {
      const media = await mediaStore.uploadFile(file)
      const item = createItem(media.url, file.name.replace(/\.[^.]+$/, ''))
      items.value.push(item)
      return item.id
    })
    const ids = await Promise.all(uploads)
    ids.forEach(id => renderItem(id))
  }

  function addImageUrls(urls: string[]) {
    const ids: string[] = []
    for (const url of urls) {
      const item = createItem(url)
      items.value.push(item)
      ids.push(item.id)
    }
    ids.forEach(id => renderItem(id))
  }

  function removeItem(id: string) {
    items.value = items.value.filter(i => i.id !== id)
    if (editingItemId.value === id) editingItemId.value = null
  }

  // --- Rendering ---

  async function renderItem(id: string) {
    const item = items.value.find(i => i.id === id)
    if (!item || !selectedTemplateId.value) return

    item.loading = true
    try {
      const p = new URLSearchParams()
      p.set('t', selectedTemplateId.value)
      if (item.featureImage) p.set('feature_image', item.featureImage)
      if (item.title) p.set('title', item.title)
      if (item.subtitle) p.set('subtitle', item.subtitle)
      // Merge per-item param overrides
      for (const [k, v] of Object.entries(item.params)) {
        if (v) p.set(k, v)
      }
      const res = await fetch(`/api/render/html?${p.toString()}`)
      item.previewHtml = res.ok ? await res.text() : '<div style="padding:1rem;color:red">Render error</div>'
    } catch {
      item.previewHtml = '<div style="padding:1rem;color:red">Render failed</div>'
    } finally {
      item.loading = false
    }
  }

  async function renderAll() {
    if (!selectedTemplateId.value || !items.value.length) return
    renderQueue.value = items.value.length

    // Concurrency-limited to 3 parallel renders
    const queue = [...items.value.map(i => i.id)]
    const run = async () => {
      while (queue.length) {
        const id = queue.shift()!
        await renderItem(id)
        renderQueue.value--
      }
    }
    await Promise.all([run(), run(), run()])
  }

  // --- Param updates with debounced re-render ---

  const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>()

  function updateItemParam(id: string, key: string, value: string) {
    const item = items.value.find(i => i.id === id)
    if (!item) return

    // Handle special keys
    if (key === 'title') item.title = value
    else if (key === 'subtitle') item.subtitle = value
    else if (key === 'feature_image') item.featureImage = value
    else item.params[key] = value

    // Debounced re-render
    const timer = debounceTimers.get(id)
    if (timer) clearTimeout(timer)
    debounceTimers.set(id, setTimeout(() => {
      debounceTimers.delete(id)
      renderItem(id)
    }, 300))
  }

  // --- Selection ---

  function toggleItem(id: string) {
    const item = items.value.find(i => i.id === id)
    if (item) item.selected = !item.selected
  }

  function selectAll() { items.value.forEach(i => i.selected = true) }
  function deselectAll() { items.value.forEach(i => i.selected = false) }

  function toggleSelectAll() {
    if (selectedItems.value.length === items.value.length) deselectAll()
    else selectAll()
  }

  // --- Editor ---

  function openEditor(id: string) { editingItemId.value = id }
  function closeEditor() { editingItemId.value = null }

  // Re-render all when template changes
  watch(selectedTemplateId, () => {
    if (items.value.length) renderAll()
  })

  return {
    templates, selectedTemplateId, selectedTemplate,
    items, editingItemId, editingItem, renderQueue,
    loadTemplates,
    addImages, addImageUrls, removeItem,
    renderItem, renderAll,
    updateItemParam,
    toggleItem, selectAll, deselectAll, toggleSelectAll, selectedItems,
    openEditor, closeEditor,
  }
}
