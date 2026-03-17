<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Template } from '../stores/templates'
import MpBadge from './ui/MpBadge.vue'
import MpButton from './ui/MpButton.vue'

const props = defineProps<{
  template: Template
}>()

const emit = defineEmits<{
  edit: []
  delete: []
}>()

const coverUrl = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`/api/screenshot?t=${props.template.id}`)
    if (res.ok) {
      const data = await res.json()
      coverUrl.value = data.url
    }
  } catch {
    // fallback: no cover image
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="template-card">
    <!-- Preview thumbnail as image -->
    <div class="template-card__preview">
      <div v-if="loading" class="template-card__loading">Loading...</div>
      <img
        v-else-if="coverUrl"
        :src="coverUrl"
        :alt="template.name"
        class="template-card__cover"
      />
      <div v-else class="template-card__placeholder">No preview</div>
    </div>

    <div class="template-card__body">
      <div class="template-card__header">
        <span class="template-card__name">{{ template.name }}</span>
        <MpBadge variant="new">{{ template.layout }}</MpBadge>
      </div>

      <div class="template-card__meta">
        <span class="template-card__detail">{{ template.size }}</span>
        <span class="template-card__sep">·</span>
        <span class="template-card__detail">{{ template.brand }}</span>
      </div>

      <div class="template-card__actions">
        <MpButton variant="ghost" size="sm" @click="emit('edit')">Edit</MpButton>
        <MpButton variant="ghost" size="sm" @click="emit('delete')">Delete</MpButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.template-card {
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
  overflow: hidden;
  border: 1px solid var(--mp-rule);
  transition: box-shadow 0.15s;
}

.template-card:hover {
  box-shadow: var(--mp-shadow-sm);
}

.template-card__preview {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: var(--mp-bg3);
  overflow: hidden;
  position: relative;
}

.template-card__cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-card__loading,
.template-card__placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 12px;
  color: var(--mp-muted);
}

.template-card__body {
  padding: var(--mp-s4);
  display: flex;
  flex-direction: column;
  gap: var(--mp-s2);
}

.template-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--mp-s2);
}

.template-card__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--mp-ink);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.template-card__meta {
  display: flex;
  align-items: center;
  gap: var(--mp-s1);
}

.template-card__detail {
  font-family: var(--mp-font-mono);
  font-size: 10px;
  color: var(--mp-muted);
}

.template-card__sep {
  color: var(--mp-rule);
  font-size: 10px;
}

.template-card__actions {
  display: flex;
  gap: var(--mp-s2);
  margin-top: var(--mp-s1);
}
</style>
