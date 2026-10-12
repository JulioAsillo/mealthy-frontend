<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import AppToolbar from '@/shared/presentation/components/AppToolbar.vue'
import AppFooter from '@/shared/presentation/components/AppFooter.vue'
import UserMenu from '@/shared/presentation/components/UserMenu.vue'
import type { NavItem } from '@/shared/presentation/components/nav-item'
import { useAuthStore } from '@/security/application/auth.store'
import type { Role } from '@/security/domain/model/role'

const { role } = storeToRefs(useAuthStore())

/** Menú por rol. Las fases 4-6 irán añadiendo Recetas, Despensa, Mercado y Mi tienda. */
const NAV_BY_ROLE: Record<Role, NavItem[]> = {
  Customer: [{ label: 'Mi perfil', to: { name: 'profile' }, icon: 'pi pi-user' }],
  StoreOwner: [{ label: 'Mi perfil', to: { name: 'profile' }, icon: 'pi pi-user' }],
  Admin: [{ label: 'Mi perfil', to: { name: 'profile' }, icon: 'pi pi-user' }],
}

const items = computed<NavItem[]>(() => (role.value ? NAV_BY_ROLE[role.value] : []))
</script>

<template>
  <div class="layout">
    <AppToolbar :items="items">
      <template #end>
        <UserMenu />
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
</style>
