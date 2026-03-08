<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{
  accept?: string
  label?: string
  uploading?: boolean
}>()

const emit = defineEmits<{
  upload: [file: File]
}>()

const dragOver = ref(false)
const inputRef = ref<HTMLInputElement | null>(null)

function onDrop(e: DragEvent) {
  dragOver.value = false
  const file = e.dataTransfer?.files?.[0]
  if (file) emit('upload', file)
}

function onFileChange(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) emit('upload', file)
  // Reset so same file can be re-selected
  if (inputRef.value) inputRef.value.value = ''
}
</script>

<template>
  <div
    :class="['file-upload', { 'file-upload--drag': dragOver, 'file-upload--busy': uploading }]"
    @dragover.prevent="dragOver = true"
    @dragleave="dragOver = false"
    @drop.prevent="onDrop"
    @click="inputRef?.click()"
    role="button"
    tabindex="0"
    @keydown.enter="inputRef?.click()"
  >
    <input
      ref="inputRef"
      type="file"
      :accept="accept"
      class="file-upload__input"
      @change="onFileChange"
    />

    <span v-if="uploading" class="file-upload__spinner" aria-hidden="true" />
    <template v-else>
      <span class="file-upload__icon" aria-hidden="true">↑</span>
      <span class="file-upload__label">{{ label ?? 'Drop file or click to upload' }}</span>
    </template>
  </div>
</template>

<style scoped>
.file-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--mp-s2);
  padding: var(--mp-s5) var(--mp-s4);
  border: 1.5px dashed var(--mp-rule);
  border-radius: var(--mp-radius);
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  background: var(--mp-bg2);
  min-height: 80px;
  user-select: none;
}

.file-upload:hover,
.file-upload--drag {
  border-color: var(--mp-terra);
  background: rgba(192, 90, 48, 0.04);
}

.file-upload--busy {
  pointer-events: none;
  opacity: 0.6;
}

.file-upload__input {
  display: none;
}

.file-upload__icon {
  font-size: 20px;
  color: var(--mp-muted);
  line-height: 1;
}

.file-upload__label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-align: center;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.file-upload__spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--mp-rule);
  border-top-color: var(--mp-terra);
  border-radius: 50%;
  animation: fu-spin 0.6s linear infinite;
}

@keyframes fu-spin {
  to { transform: rotate(360deg); }
}
</style>
