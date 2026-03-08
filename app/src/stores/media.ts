// Media library store - manages uploaded and external images
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../api/client'

export interface MediaItem {
  id: string
  name: string
  url: string
  thumb_url?: string
  source: 'upload' | 'pexels' | 'unsplash'
  tags: string[]
  width?: number
  height?: number
  created_at?: string
}

export const useMediaStore = defineStore('media', () => {
  const items = ref<MediaItem[]>([])
  const loading = ref(false)
  const error = ref('')

  async function fetchMedia(query?: string, source?: string) {
    loading.value = true
    error.value = ''
    try {
      const params = new URLSearchParams()
      if (query) params.set('q', query)
      if (source) params.set('source', source)
      const url = '/api/media' + (params.toString() ? '?' + params.toString() : '')
      items.value = await apiFetch<MediaItem[]>(url)
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Failed to load media'
    } finally {
      loading.value = false
    }
  }

  async function uploadFile(file: File, name?: string, tags?: string[]): Promise<MediaItem> {
    const form = new FormData()
    form.append('file', file)
    if (name) form.append('name', name)
    if (tags) form.append('tags', JSON.stringify(tags))

    const res = await fetch('/api/media', { method: 'POST', body: form })
    if (!res.ok) throw new Error('Upload failed')
    const item = await res.json() as MediaItem
    items.value.unshift(item)
    return item
  }

  async function saveExternal(data: {
    name: string
    url: string
    thumb_url?: string
    source: 'pexels' | 'unsplash'
    tags?: string[]
    width?: number
    height?: number
  }): Promise<MediaItem> {
    const item = await apiFetch<MediaItem>('/api/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    items.value.unshift(item)
    return item
  }

  async function deleteMedia(id: string) {
    await apiFetch(`/api/media/${id}`, { method: 'DELETE' })
    items.value = items.value.filter(m => m.id !== id)
  }

  return { items, loading, error, fetchMedia, uploadFile, saveExternal, deleteMedia }
})
