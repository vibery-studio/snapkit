import { ref } from 'vue'
import type { SizePreset } from '../types'
import { apiFetch } from '../api/client'

// Composable for fetching available size presets from the Worker API
export function useSizes() {
  const sizes = ref<SizePreset[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSizes() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<{ sizes: Array<{ id: string; name: string; width: number; height: number; category: SizePreset['category'] }> }>('/api/sizes')
      sizes.value = data.sizes.map(s => ({ id: s.id, name: s.name, w: s.width, h: s.height, category: s.category }))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load sizes'
    } finally {
      loading.value = false
    }
  }

  return { sizes, loading, error, fetchSizes }
}
