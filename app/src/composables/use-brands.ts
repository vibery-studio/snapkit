import { useBrandsStore } from '../stores/brands'
import { storeToRefs } from 'pinia'

// Composable for accessing brand kits data and fetch action
export function useBrands() {
  const store = useBrandsStore()
  const { brands, loading, error } = storeToRefs(store)
  return { brands, loading, error, fetchBrands: store.fetchBrands }
}
