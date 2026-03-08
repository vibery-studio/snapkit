<script setup lang="ts">
defineProps<{
  variant?: 'live' | 'soon' | 'featured' | 'new'
}>()
</script>

<template>
  <span :class="['mp-badge', `mp-badge--${variant ?? 'new'}`]">
    <slot />
  </span>
</template>

<style scoped>
.mp-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--mp-s1);
  padding: 2px 8px;
  border-radius: var(--mp-radius-sm);
  font-family: var(--mp-font-mono);
  font-size: 10px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  line-height: 1.6;
}

.mp-badge--live {
  background: rgba(90, 122, 96, 0.12);
  color: var(--mp-sage);
}

.mp-badge--soon {
  background: rgba(200, 168, 130, 0.18);
  color: #8a6a3a;
}

.mp-badge--featured {
  background: rgba(192, 90, 48, 0.10);
  color: var(--mp-terra);
}

.mp-badge--new {
  background: var(--mp-bg3);
  color: var(--mp-muted);
}
</style>
