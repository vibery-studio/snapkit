<script setup lang="ts">
import type { BulkCanvasItem } from '../composables/use-bulk-canvas'
import BulkCanvasCard from './bulk-canvas-card.vue'

defineProps<{
  items: BulkCanvasItem[]
}>()

const emit = defineEmits<{
  'toggle-select': [id: string]
  'edit': [id: string]
  'remove': [id: string]
}>()
</script>

<template>
  <div class="grid-wrap">
    <div v-if="items.length === 0" class="grid-empty">
      <p>Drop images or use the toolbar to add items</p>
    </div>
    <div v-else class="grid">
      <BulkCanvasCard
        v-for="item in items"
        :key="item.id"
        :item="item"
        @toggle-select="emit('toggle-select', $event)"
        @edit="emit('edit', $event)"
        @remove="emit('remove', $event)"
      />
    </div>
  </div>
</template>

<style scoped>
.grid-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.grid-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 300px;
  color: var(--mp-muted, #999);
  font-size: 14px;
}
</style>
