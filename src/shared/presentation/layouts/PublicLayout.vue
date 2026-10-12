<script setup lang="ts">
import AppToolbar from '@/shared/presentation/components/AppToolbar.vue'
import AppFooter from '@/shared/presentation/components/AppFooter.vue'
import type { NavItem } from '@/shared/presentation/components/nav-item'

// Fase 3: añadir "Iniciar sesión" y "Registrarse".
const items: NavItem[] = [{ label: 'Inicio', to: { name: 'home' }, icon: 'pi pi-home' }]
</script>

<template>
  <div class="layout">
    <AppToolbar :items="items" />
    <main class="layout__content">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>

<style scoped>
.layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout__content {
  flex: 1;
}
</style>
