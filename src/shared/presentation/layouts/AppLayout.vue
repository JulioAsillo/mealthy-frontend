<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import AppToolbar from '@/shared/presentation/components/AppToolbar.vue'
import AppFooter from '@/shared/presentation/components/AppFooter.vue'
import UserMenu from '@/shared/presentation/components/UserMenu.vue'
import ThemeToggle from '@/shared/presentation/components/ThemeToggle.vue'
import type { NavItem } from '@/shared/presentation/components/nav-item'
import { useAuthStore } from '@/security/application/auth.store'
import type { Role } from '@/security/domain/model/role'

/**
 * Layout único: adapta menú y acciones según haya sesión y rol.
 * Las rutas privadas se protegen con meta.requiresAuth en cada ruta, no aquí.
 */
const { isAuthenticated, role } = storeToRefs(useAuthStore())

const RECIPES: NavItem = { label: 'Recetas', to: { name: 'recipes' }, icon: 'pi pi-book' }
const PANTRY: NavItem = { label: 'Despensa', to: { name: 'pantry' }, icon: 'pi pi-shopping-bag' }
const MARKET: NavItem = { label: 'Mercado', to: { name: 'market' }, icon: 'pi pi-shop' }
const MY_STORE: NavItem = { label: 'Mi tienda', to: { name: 'my-store' }, icon: 'pi pi-briefcase' }

/** La fase Admin añadirá el panel de administración. */
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  Customer: [RECIPES, PANTRY, MARKET],
  StoreOwner: [MY_STORE, MARKET, RECIPES],
  Admin: [RECIPES, MARKET],
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'Inicio', to: { name: 'home' }, icon: 'pi pi-home' },
  RECIPES,
  MARKET,
]

// Accesibilidad: al cambiar de página, el foco va al contenido (lectores de pantalla anuncian la nueva vista).
const route = useRoute()
const main = ref<HTMLElement | null>(null)
watch(
  () => route.path,
  async (_to, from) => {
    if (from === undefined) return
    await nextTick()
    main.value?.focus({ preventScroll: true })
  },
)

const items = computed<NavItem[]>(() =>
  isAuthenticated.value && role.value ? NAV_BY_ROLE[role.value] : PUBLIC_NAV,
)
</script>

<template>
  <div class="layout">
    <a href="#main" class="skip-link">Saltar al contenido</a>
    <AppToolbar :items="items">
      <template #end>
        <ThemeToggle />
        <UserMenu v-if="isAuthenticated" />
        <template v-else>
          <RouterLink :to="{ name: 'sign-in' }" class="layout__link">Iniciar sesión</RouterLink>
          <RouterLink :to="{ name: 'sign-up' }" custom v-slot="{ navigate }">
            <Button label="Registrarse" class="layout__cta" @click="navigate" />
          </RouterLink>
        </template>
      </template>
    </AppToolbar>
    <main id="main" ref="main" class="layout__content" tabindex="-1">
      <RouterView v-slot="{ Component, route: current }">
        <Transition name="page" mode="out-in">
          <component :is="Component" :key="current.path" />
        </Transition>
      </RouterView>
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

.layout__content:focus {
  outline: none;
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
