import { ref } from 'vue'
import type { Layout } from '../types'
import { apiFetch } from '../api/client'

// Composable for fetching available layouts from the Worker API
export function useLayouts() {
  const layouts = ref<Layout[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchLayouts() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<Layout[]>('/api/layouts')
      layouts.value = data
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load layouts'
    } finally {
      loading.value = false
    }
  }

  return { layouts, loading, error, fetchLayouts }
}
