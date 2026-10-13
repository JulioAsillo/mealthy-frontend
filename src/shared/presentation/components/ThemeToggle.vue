<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useThemeStore } from '@/shared/application/theme.store'

const theme = useThemeStore()
const { isDark } = storeToRefs(theme)
</script>

<template>
  <button
    type="button"
    class="theme-toggle"
    :aria-label="isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
    :title="isDark ? 'Modo claro' : 'Modo oscuro'"
    @click="theme.toggle()"
  >
    <i :class="isDark ? 'pi pi-sun' : 'pi pi-moon'" aria-hidden="true" />
  </button>
</template>

<style scoped>
.theme-toggle {
  display: inline-grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border: 0;
  border-radius: 50%;
  background: color-mix(in srgb, currentColor 12%, transparent);
  color: inherit;
  cursor: pointer;
  margin-left: 0.25rem;
}

.theme-toggle:hover {
  background: color-mix(in srgb, currentColor 22%, transparent);
}

.theme-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}
</style>
