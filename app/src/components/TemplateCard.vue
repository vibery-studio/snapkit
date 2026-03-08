<script setup lang="ts">
import { computed } from 'vue'
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

// Calculate scale to fit thumbnail in preview container (like object-fit: contain)
const iframeStyle = computed(() => {
  const tw = props.template.dimensions?.width || 1280
  const th = props.template.dimensions?.height || 720
  // Preview container is ~400px wide, 16:9 aspect = 225px tall
  const containerW = 400
  const containerH = 225
  const scale = Math.min(containerW / tw, containerH / th)
  return {
    width: `${tw}px`,
    height: `${th}px`,
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
  }
})
</script>

<template>
  <div class="template-card">
    <!-- Preview thumbnail via render API -->
    <div class="template-card__preview">
      <iframe
        :src="`/api/render?t=${template.id}`"
        :title="template.name"
        class="template-card__iframe"
        :style="iframeStyle"
      />
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

.template-card__iframe {
  position: absolute;
  top: 0;
  left: 0;
  border: none;
  pointer-events: none;
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
