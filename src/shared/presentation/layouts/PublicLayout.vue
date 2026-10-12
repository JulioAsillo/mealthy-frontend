<script setup lang="ts">
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import AppToolbar from '@/shared/presentation/components/AppToolbar.vue'
import AppFooter from '@/shared/presentation/components/AppFooter.vue'
import type { NavItem } from '@/shared/presentation/components/nav-item'
import { useAuthStore } from '@/security/application/auth.store'
import { homeRouteFor } from '@/security/application/home-route'

const auth = useAuthStore()
const { isAuthenticated, role } = storeToRefs(auth)

const items: NavItem[] = [{ label: 'Inicio', to: { name: 'home' }, icon: 'pi pi-home' }]
</script>

<template>
  <div class="layout">
    <AppToolbar :items="items">
      <template #end>
        <RouterLink v-if="isAuthenticated" :to="homeRouteFor(role)" custom v-slot="{ navigate }">
          <Button label="Mi cuenta" icon="pi pi-user" class="layout__cta" @click="navigate" />
        </RouterLink>
        <template v-else>
          <RouterLink :to="{ name: 'sign-in' }" class="layout__link">Iniciar sesión</RouterLink>
          <RouterLink :to="{ name: 'sign-up' }" custom v-slot="{ navigate }">
            <Button label="Registrarse" class="layout__cta" @click="navigate" />
          </RouterLink>
        </template>
      </template>
    </AppToolbar>
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

.layout__link {
  color: inherit;
  text-decoration: none;
  font-weight: 600;
  padding: 0.5rem 0.875rem;
}

.layout__link:hover {
  text-decoration: underline;
}

.layout__cta {
  margin-left: 0.5rem;
  background: var(--p-primary-contrast-color);
  color: var(--p-primary-color);
  border-color: var(--p-primary-contrast-color);
}
</style>
