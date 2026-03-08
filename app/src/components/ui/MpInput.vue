<script setup lang="ts">
defineProps<{
  label?: string
  modelValue?: string
  type?: string
  placeholder?: string
  error?: string
  disabled?: boolean
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="mp-input-wrap">
    <label v-if="label" class="mp-input__label">{{ label }}</label>
    <input
      :class="['mp-input', { 'mp-input--error': error }]"
      :type="type ?? 'text'"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
    <span v-if="error" class="mp-input__error">{{ error }}</span>
  </div>
</template>

<style scoped>
.mp-input-wrap {
  display: flex;
  flex-direction: column;
  gap: var(--mp-s1);
}

.mp-input__label {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: var(--mp-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mp-input {
  background: var(--mp-bg2);
  border: 1px solid transparent;
  border-radius: var(--mp-radius);
  padding: 10px 14px;
  font-family: var(--mp-font-body);
  font-size: 14px;
  color: var(--mp-ink);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}

.mp-input::placeholder {
  color: var(--mp-light);
}

.mp-input:focus {
  border-color: var(--mp-terra);
}

.mp-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mp-input--error {
  border-color: #c0392b;
}

.mp-input__error {
  font-family: var(--mp-font-mono);
  font-size: 11px;
  color: #c0392b;
}
</style>
