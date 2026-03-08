<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

// Nav items: Builder, Brands, Templates
const navItems = [
  { path: '/', icon: 'builder', label: 'Builder' },
  { path: '/manage/brands', icon: 'brands', label: 'Brands' },
  { path: '/manage/templates', icon: 'templates', label: 'Templates' },
]

function isActive(path: string) {
  if (path === '/') return route.path === '/'
  return route.path.startsWith(path)
}
</script>

<template>
  <div class="mp-layout">
    <!-- Left gutter / sidebar -->
    <nav class="mp-layout__sidebar" aria-label="Main navigation">
      <div class="mp-layout__logo">
        <span class="mp-layout__logo-mark">S</span>
      </div>

      <ul class="mp-layout__nav">
        <li v-for="item in navItems" :key="item.path">
          <RouterLink
            :to="item.path"
            :class="['mp-layout__nav-item', { 'mp-layout__nav-item--active': isActive(item.path) }]"
            :title="item.label"
          >
            <!-- Builder icon -->
            <svg v-if="item.icon === 'builder'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".8"/>
              <rect x="11" y="2" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4"/>
              <rect x="2" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".4"/>
              <rect x="11" y="11" width="7" height="7" rx="1.5" fill="currentColor" opacity=".2"/>
            </svg>
            <!-- Brands icon -->
            <svg v-if="item.icon === 'brands'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="10" r="7" stroke="currentColor" stroke-width="1.5"/>
              <circle cx="10" cy="10" r="3" fill="currentColor"/>
            </svg>
            <!-- Templates icon -->
            <svg v-if="item.icon === 'templates'" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="2" width="16" height="5" rx="1.5" fill="currentColor" opacity=".7"/>
              <rect x="2" y="9" width="10" height="3" rx="1.5" fill="currentColor" opacity=".5"/>
              <rect x="2" y="14" width="7" height="3" rx="1.5" fill="currentColor" opacity=".3"/>
            </svg>
            <span class="mp-layout__nav-label">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <!-- Main content area -->
    <main class="mp-layout__content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.mp-layout {
  display: flex;
  min-height: 100vh;
  background: var(--mp-bg);
}

/* Sidebar / left gutter */
.mp-layout__sidebar {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: var(--mp-gutter);
  min-height: 100vh;
  background: var(--mp-bg2);
  border-right: 1px solid var(--mp-rule);
  padding: var(--mp-s6) 0;
  position: sticky;
  top: 0;
  height: 100vh;
  flex-shrink: 0;
}

.mp-layout__logo {
  width: 36px;
  height: 36px;
  background: var(--mp-terra);
  border-radius: var(--mp-radius);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: var(--mp-s7);
}

.mp-layout__logo-mark {
  font-family: var(--mp-font-heading);
  font-weight: 700;
  font-size: 18px;
  color: #fff;
  line-height: 1;
}

.mp-layout__nav {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: var(--mp-s2);
  width: 100%;
  padding: 0 var(--mp-s3);
}

.mp-layout__nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--mp-s1);
  padding: var(--mp-s2) var(--mp-s1);
  border-radius: var(--mp-radius);
  color: var(--mp-muted);
  text-decoration: none;
  transition: background 0.15s, color 0.15s;
}

.mp-layout__nav-item:hover {
  background: var(--mp-bg3);
  color: var(--mp-ink);
}

.mp-layout__nav-item--active {
  background: var(--mp-bg3);
  color: var(--mp-terra);
}

.mp-layout__nav-label {
  font-family: var(--mp-font-mono);
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  line-height: 1;
}

/* Content area */
.mp-layout__content {
  flex: 1;
  min-width: 0;
  max-width: var(--mp-max-width);
}

/* Mobile: collapse sidebar to bottom tab bar */
@media (max-width: 640px) {
  .mp-layout {
    flex-direction: column;
  }

  .mp-layout__sidebar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    top: auto;
    width: 100%;
    height: auto;
    min-height: unset;
    flex-direction: row;
    justify-content: space-around;
    padding: var(--mp-s2) var(--mp-s4);
    border-right: none;
    border-top: 1px solid var(--mp-rule);
    z-index: 100;
  }

  .mp-layout__logo {
    display: none;
  }

  .mp-layout__nav {
    flex-direction: row;
    width: 100%;
    justify-content: space-around;
    gap: 0;
    padding: 0;
  }

  .mp-layout__content {
    padding-bottom: 72px;
  }
}
</style>
