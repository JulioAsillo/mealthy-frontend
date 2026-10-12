<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import Avatar from 'primevue/avatar'
import Menu from 'primevue/menu'
import type { MenuItem } from 'primevue/menuitem'
import { useAuthStore } from '@/security/application/auth.store'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const router = useRouter()
const menu = ref<InstanceType<typeof Menu> | null>(null)

const items: MenuItem[] = [
  { label: 'Mi perfil', icon: 'pi pi-user', command: () => router.push({ name: 'profile' }) },
  { separator: true },
  {
    label: 'Cerrar sesión',
    icon: 'pi pi-sign-out',
    command: async () => {
      await auth.signOut()
      await router.replace({ name: 'sign-in' })
    },
  },
]
</script>

<template>
  <template v-if="user">
    <button
      type="button"
      class="user-menu"
      aria-haspopup="true"
      aria-controls="user-menu"
      @click="menu?.toggle($event)"
    >
      <Avatar :label="user.initials" shape="circle" class="user-menu__avatar" />
      <span class="user-menu__name">{{ user.firstName }}</span>
      <i class="pi pi-angle-down" aria-hidden="true" />
    </button>
    <Menu id="user-menu" ref="menu" :model="items" popup />
  </template>
</template>

<style scoped>
.user-menu {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 0.5rem;
  padding: 0.25rem 0.5rem 0.25rem 0.25rem;
  border: 0;
  border-radius: 999px;
  background: color-mix(in srgb, currentColor 12%, transparent);
  color: inherit;
  font: inherit;
  font-weight: 600;
  cursor: pointer;
}

.user-menu:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.user-menu__avatar {
  background: var(--p-primary-contrast-color);
  color: var(--p-primary-color);
  width: 2rem;
  height: 2rem;
}
</style>
