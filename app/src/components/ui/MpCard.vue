<script setup lang="ts">
defineProps<{
  padding?: 'sm' | 'md' | 'lg'
}>()
</script>

<template>
  <div :class="['mp-card', `mp-card--${padding ?? 'md'}`]">
    <slot />
  </div>
</template>

<style scoped>
.mp-card {
  background: var(--mp-bg2);
  border-radius: var(--mp-radius);
  box-shadow: var(--mp-shadow-sm);
}

.mp-card--sm  { padding: var(--mp-s3); }
.mp-card--md  { padding: var(--mp-s6); }
.mp-card--lg  { padding: var(--mp-s8); }
</style>
