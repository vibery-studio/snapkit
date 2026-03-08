import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BrandKit } from '../types'
import { apiFetch } from '../api/client'

// Brands state: loaded brand kits from API with full CRUD and asset management
export const useBrandsStore = defineStore('brands', () => {
  const brands = ref<BrandKit[]>([])
  const selectedId = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const selected = computed(() => brands.value.find((b: BrandKit) => b.id === selectedId.value) ?? null)

  // Fetch full brand detail (with logos, backgrounds)
  async function fetchBrandDetail(id: string) {
    const full = await apiFetch<BrandKit>(`/api/brands/${id}`)
    const idx = brands.value.findIndex((b: BrandKit) => b.id === id)
    if (idx !== -1) brands.value[idx] = full
    return full
  }

  async function fetchBrands() {
    loading.value = true
    error.value = null
    try {
      const data = await apiFetch<{ brands: BrandKit[] }>('/api/brands')
      brands.value = data.brands
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load brands'
    } finally {
      loading.value = false
    }
  }

  async function createBrand(data: { name: string; slug: string }) {
    const brand = await apiFetch<BrandKit>('/api/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    brands.value.push(brand)
    return brand
  }

  async function updateBrand(id: string, data: Partial<BrandKit>) {
    const updated = await apiFetch<BrandKit>(`/api/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    const idx = brands.value.findIndex((b: BrandKit) => b.id === id)
    if (idx !== -1) brands.value[idx] = updated
    return updated
  }

  async function deleteBrand(id: string) {
    await apiFetch(`/api/brands/${id}`, { method: 'DELETE' })
    brands.value = brands.value.filter((b: BrandKit) => b.id !== id)
    if (selectedId.value === id) selectedId.value = null
  }

  // Upload logo - sends file as multipart/form-data
  async function uploadLogo(brandId: string, file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/brands/${brandId}/assets/logos`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
    const updated = await res.json() as BrandKit
    const idx = brands.value.findIndex((b: BrandKit) => b.id === brandId)
    if (idx !== -1) brands.value[idx] = updated
  }

  async function deleteLogo(brandId: string, logoId: string) {
    await apiFetch(`/api/brands/${brandId}/assets/logos/${logoId}`, { method: 'DELETE' })
    await fetchBrands()
  }

  // Upload background
  async function uploadBg(brandId: string, file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/brands/${brandId}/assets/backgrounds`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
    const updated = await res.json() as BrandKit
    const idx = brands.value.findIndex((b: BrandKit) => b.id === brandId)
    if (idx !== -1) brands.value[idx] = updated
  }

  async function deleteBg(brandId: string, bgName: string) {
    await apiFetch(`/api/brands/${brandId}/assets/backgrounds/${encodeURIComponent(bgName)}`, { method: 'DELETE' })
    await fetchBrands()
  }

  // Upload watermark
  async function uploadWatermark(brandId: string, file: File) {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`/api/brands/${brandId}/assets/watermark`, {
      method: 'POST',
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${await res.text()}`)
    const updated = await res.json() as BrandKit
    const idx = brands.value.findIndex((b: BrandKit) => b.id === brandId)
    if (idx !== -1) brands.value[idx] = updated
  }

  return {
    brands, selectedId, selected, loading, error,
    fetchBrands, fetchBrandDetail, createBrand, updateBrand, deleteBrand,
    uploadLogo, deleteLogo, uploadBg, deleteBg, uploadWatermark,
  }
})
