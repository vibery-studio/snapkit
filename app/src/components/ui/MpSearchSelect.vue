<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  label?: string
  modelValue?: string
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const search = ref('')
const inputRef = ref<HTMLInputElement | null>(null)
const containerRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const opt = props.options.find(o => o.value === props.modelValue)
  return opt?.label || ''
})

const filteredOptions = computed(() => {
  if (!search.value) return props.options
  const q = search.value.toLowerCase()
  return props.options.filter(o => o.label.toLowerCase().includes(q))
})

function open() {
  isOpen.value = true
  search.value = ''
  setTimeout(() => inputRef.value?.focus(), 0)
}

function select(opt: Option) {
  emit('update:modelValue', opt.value)
  isOpen.value = false
  search.value = ''
}

function handleClickOutside(e: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(e.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="mp-search-select" ref="containerRef">
    <label v-if="label" class="mp-search-select__label">{{ label }}</label>
    <div class="mp-search-select__trigger" @click="open">
      <span :class="['mp-search-select__value', { 'mp-search-select__value--placeholder': !modelValue }]">
        {{ selectedLabel || placeholder || 'Select...' }}
      </span>
      <span class="mp-search-select__arrow">▼</span>
    </div>
    <div v-if="isOpen" class="mp-search-select__dropdown">
      <input
        ref="inputRef"
        v-model="search"
        class="mp-search-select__search"
        placeholder="Search..."
        @keydown.esc="isOpen = false"
      />
      <div class="mp-search-select__list">
        <div
          v-for="opt in filteredOptions"
          :key="opt.value"
          :class="['mp-search-select__option', { 'mp-search-select__option--active': opt.value === modelValue }]"
          @click="select(opt)"
        >
          {{ opt.label }}
        </div>
        <div v-if="!filteredOptions.length" class="mp-search-select__empty">No results</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mp-search-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.mp-search-select__label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mp-search-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--mp-bg2);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  padding: 10px 14px;
  cursor: pointer;
  transition: border-color 0.15s;
}

.mp-search-select__trigger:hover {
  border-color: var(--mp-terra);
}

.mp-search-select__value {
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
}

.mp-search-select__value--placeholder {
  color: var(--mp-light);
}

.mp-search-select__arrow {
  font-size: 10px;
  color: var(--mp-muted);
}

.mp-search-select__dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: var(--mp-bg);
  border: 1px solid var(--mp-rule);
  border-radius: var(--mp-radius);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  z-index: 100;
  max-height: 280px;
  display: flex;
  flex-direction: column;
}

.mp-search-select__search {
  border: none;
  border-bottom: 1px solid var(--mp-rule);
  padding: 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  background: transparent;
  outline: none;
}

.mp-search-select__search::placeholder {
  color: var(--mp-light);
}

.mp-search-select__list {
  overflow-y: auto;
  max-height: 220px;
}

.mp-search-select__option {
  padding: 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  cursor: pointer;
  transition: background 0.1s;
}

.mp-search-select__option:hover {
  background: var(--mp-bg2);
}

.mp-search-select__option--active {
  background: var(--mp-terra);
  color: #fff;
}

.mp-search-select__option--active:hover {
  background: var(--mp-terra);
}

.mp-search-select__empty {
  padding: 10px 14px;
  font-size: 13px;
  color: var(--mp-muted);
  text-align: center;
}
</style>
