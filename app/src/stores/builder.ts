import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SizePreset, Layout, BrandKit } from '../types'

// Builder state: selected size, layout, brand, and params for the active design
export const useBuilderStore = defineStore('builder', () => {
  const selectedSize = ref<SizePreset | null>(null)
  const selectedLayout = ref<Layout | null>(null)
  const selectedBrand = ref<BrandKit | null>(null)
  const params = ref<Record<string, string | boolean | number>>({})

  function setSize(size: SizePreset) {
    selectedSize.value = size
  }

  function setLayout(layout: Layout, preserveParams = false) {
    selectedLayout.value = layout
    if (!preserveParams) {
      params.value = {}
    }
  }

  function setBrand(brand: BrandKit) {
    selectedBrand.value = brand
  }

  function setParam(key: string, value: string | boolean | number) {
    params.value = { ...params.value, [key]: value }
  }

  function resetParams() {
    params.value = {}
  }

  function reset() {
    selectedSize.value = null
    selectedLayout.value = null
    selectedBrand.value = null
    params.value = {}
  }

  return { selectedSize, selectedLayout, selectedBrand, params, setSize, setLayout, setBrand, setParam, resetParams, reset }
})
