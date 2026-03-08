import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiFetch } from '../api/client'

export interface Template {
  id: string
  name: string
  layout: string
  brand: string
  size: string
  params: Record<string, string | boolean | number>
  created_at?: string
}

// Templates state: manage saved templates via API
export const useTemplatesStore = defineStore('templates', () => {
  const templates = ref<Template[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchTemplates() {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch<{ templates: Template[] }>('/api/templates')
      templates.value = res.templates
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load templates'
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(data: Omit<Template, 'id' | 'created_at'>) {
    const tpl = await apiFetch<Template>('/api/templates', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    templates.value.push(tpl)
    return tpl
  }

  async function updateTemplate(id: string, data: Partial<Template>) {
    const updated = await apiFetch<Template>(`/api/templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    const idx = templates.value.findIndex((t: Template) => t.id === id)
    if (idx !== -1) templates.value[idx] = updated
    return updated
  }

  async function deleteTemplate(id: string) {
    await apiFetch(`/api/templates/${id}`, { method: 'DELETE' })
    templates.value = templates.value.filter((t: Template) => t.id !== id)
  }

  return { templates, loading, error, fetchTemplates, createTemplate, updateTemplate, deleteTemplate }
})
