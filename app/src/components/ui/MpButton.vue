<script setup lang="ts">
defineProps<{
  variant?: 'primary' | 'secondary' | 'ghost' | 'text'
  size?: 'sm' | 'md'
  disabled?: boolean
  loading?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<template>
  <button
    :class="['mp-btn', `mp-btn--${variant ?? 'primary'}`, `mp-btn--${size ?? 'md'}`, { 'mp-btn--loading': loading }]"
    :disabled="disabled || loading"
    :type="type ?? 'button'"
  >
    <span v-if="loading" class="mp-btn__spinner" aria-hidden="true" />
    <slot />
  </button>
</template>

<style scoped>
.mp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--mp-s2);
  border: none;
  border-radius: var(--mp-radius);
  font-family: var(--mp-font-body);
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s, color 0.15s, opacity 0.15s;
  white-space: nowrap;
  line-height: 1;
}

.mp-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Sizes */
.mp-btn--sm {
  padding: var(--mp-s2) var(--mp-s3);
  font-size: 12px;
}
.mp-btn--md {
  padding: 10px var(--mp-s4);
  font-size: 14px;
}

/* Variants */
.mp-btn--primary {
  background: var(--mp-terra);
  color: #fff;
}
.mp-btn--primary:hover:not(:disabled) {
  background: var(--mp-terra2);
}

.mp-btn--secondary {
  background: var(--mp-bg2);
  color: var(--mp-ink);
}
.mp-btn--secondary:hover:not(:disabled) {
  background: var(--mp-bg3);
}

.mp-btn--ghost {
  background: transparent;
  color: var(--mp-muted);
  border: 1px solid var(--mp-rule);
}
.mp-btn--ghost:hover:not(:disabled) {
  background: var(--mp-bg2);
  color: var(--mp-ink);
}

.mp-btn--text {
  background: transparent;
  color: var(--mp-terra);
  padding-left: 0;
  padding-right: 0;
}
.mp-btn--text:hover:not(:disabled) {
  color: var(--mp-terra2);
}

/* Spinner */
.mp-btn__spinner {
  width: 12px;
  height: 12px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: mp-spin 0.6s linear infinite;
}

@keyframes mp-spin {
  to { transform: rotate(360deg); }
}
</style>
