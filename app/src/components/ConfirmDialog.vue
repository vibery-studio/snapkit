<script setup lang="ts">
import MpButton from './ui/MpButton.vue'

defineProps<{
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  dangerous?: boolean
}>()

const emit = defineEmits<{
  confirm: []
  cancel: []
}>()
</script>

<template>
  <Teleport to="body">
    <div class="confirm-overlay" @click.self="emit('cancel')">
      <div class="confirm-dialog" role="dialog" aria-modal="true">
        <h3 class="confirm-dialog__title">{{ title ?? 'Confirm' }}</h3>
        <p class="confirm-dialog__message">{{ message }}</p>
        <div class="confirm-dialog__actions">
          <MpButton variant="ghost" @click="emit('cancel')">
            {{ cancelLabel ?? 'Cancel' }}
          </MpButton>
          <MpButton
            :variant="dangerous ? 'primary' : 'primary'"
            :class="{ 'mp-btn--danger': dangerous }"
            @click="emit('confirm')"
          >
            {{ confirmLabel ?? 'Confirm' }}
          </MpButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-dialog {
  background: var(--mp-bg);
  border-radius: var(--mp-radius);
  box-shadow: var(--mp-shadow-lg, 0 8px 32px rgba(0,0,0,0.18));
  padding: var(--mp-s7);
  min-width: 320px;
  max-width: 440px;
  width: 90vw;
}

.confirm-dialog__title {
  font-family: var(--mp-font-heading);
  font-size: 18px;
  color: var(--mp-ink);
  margin: 0 0 var(--mp-s3);
}

.confirm-dialog__message {
  font-size: 14px;
  color: var(--mp-muted);
  margin: 0 0 var(--mp-s6);
  line-height: 1.5;
}

.confirm-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: var(--mp-s3);
}

/* Danger override - terra is fine for destructive in this design system */
:global(.mp-btn--danger) {
  background: #c0392b !important;
}
:global(.mp-btn--danger:hover:not(:disabled)) {
  background: #a93226 !important;
}
</style>
