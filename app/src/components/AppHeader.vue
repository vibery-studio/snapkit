<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <nav>
      <RouterLink to="/">Builder</RouterLink>
      <RouterLink to="/manage/brands">Brands</RouterLink>
      <RouterLink to="/manage/templates">Templates</RouterLink>
    </nav>
  </header>
</template>

<style scoped>
.app-header {
  padding: 0.75rem 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

nav {
  display: flex;
  gap: 1.5rem;
}

nav a {
  text-decoration: none;
  color: #374151;
  font-size: 0.9rem;
  font-weight: 500;
}

nav a.router-link-active {
  color: #6366f1;
}
</style>
