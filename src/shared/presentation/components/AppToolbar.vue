<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import logo from '@/assets/images/logo.jpg'
import type { NavItem } from './nav-item'

const props = defineProps<{ items: NavItem[] }>()

const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
const mobileMenuOpen = ref(false)
const route = useRoute()
const router = useRouter()

/** Activo si la ruta actual está "debajo" del enlace (/recipes activa también /recipes/5). La raíz solo en exacto. */
function isActive(item: NavItem): boolean {
  const path = router.resolve(item.to).path
  return path === '/'
    ? route.path === '/'
    : route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <header class="toolbar">
    <div class="toolbar__inner container">
      <RouterLink to="/" class="toolbar__brand">
        <img :src="logo" alt="" class="toolbar__logo" />
        <span>{{ appName }}</span>
      </RouterLink>

      <nav class="toolbar__nav" aria-label="Principal">
        <RouterLink
          v-for="item in props.items"
          :key="item.label"
          :to="item.to"
          class="toolbar__link"
          :class="{ 'toolbar__link--active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
        >
          <i v-if="item.icon" :class="item.icon" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
        <slot name="end" />
      </nav>

      <Button
        class="toolbar__burger"
        icon="pi pi-bars"
        text
        rounded
        aria-label="Abrir menú"
        @click="mobileMenuOpen = true"
      />
    </div>

    <Drawer v-model:visible="mobileMenuOpen" position="right" :header="appName">
      <nav class="toolbar__mobile-nav" aria-label="Principal móvil">
        <RouterLink
          v-for="item in props.items"
          :key="item.label"
          :to="item.to"
          class="toolbar__link"
          :class="{ 'toolbar__link--active': isActive(item) }"
          :aria-current="isActive(item) ? 'page' : undefined"
          @click="mobileMenuOpen = false"
        >
          <i v-if="item.icon" :class="item.icon" aria-hidden="true" />
          {{ item.label }}
        </RouterLink>
        <slot name="end" />
      </nav>
    </Drawer>
  </header>
</template>

<style scoped>
.toolbar {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  position: sticky;
  top: 0;
  z-index: 10;
}

.toolbar__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
}

.toolbar__brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: inherit;
  text-decoration: none;
  font-weight: 700;
  font-size: 1.25rem;
}

.toolbar__logo {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
}

.toolbar__nav {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.toolbar__link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0.875rem;
  border-radius: var(--p-border-radius-md);
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.toolbar__link:hover,
.toolbar__link--active {
  background: color-mix(in srgb, currentColor 15%, transparent);
}

.toolbar__link:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.toolbar__burger {
  display: none;
  color: inherit !important;
}

.toolbar__mobile-nav {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.toolbar__mobile-nav .toolbar__link {
  color: var(--p-text-color);
}

@media (max-width: 768px) {
  .toolbar__nav {
    display: none;
  }

  .toolbar__burger {
    display: inline-flex;
  }
}
</style>
