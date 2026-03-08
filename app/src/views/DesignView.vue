<script setup lang="ts">
import { useRoute } from 'vue-router'

// Design view - load and display a saved design by ID (Phase 7+)
const route = useRoute()
const id = route.params.id as string
</script>

<template>
  <div class="design-view">
    <h1>Design</h1>
    <p>Design ID: {{ id }}</p>
  </div>
</template>

<style scoped>
.design-view {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
