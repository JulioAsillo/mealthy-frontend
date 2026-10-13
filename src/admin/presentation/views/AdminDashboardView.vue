<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import Skeleton from 'primevue/skeleton'
import Avatar from 'primevue/avatar'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { useAuthStore } from '@/security/application/auth.store'
import { useAdminStore } from '@/admin/application/admin.store'
import RoleTag from '@/admin/presentation/components/RoleTag.vue'

const auth = useAuthStore()
const admin = useAdminStore()
const { stats, users, loadingUsers } = storeToRefs(admin)
const notify = useNotify()

const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })

onMounted(async () => {
  try {
    // Últimos registros: el backend ordena por creación; se toma la primera página.
    await Promise.all([admin.loadStats(), admin.loadUsers(1, 5)])
  } catch (e) {
    notify.error(e, 'No se pudo cargar el panel')
  }
})

const CARDS = [
  { key: 'users', label: 'Usuarios', icon: 'pi pi-users', to: { name: 'admin-users' } },
  { key: 'recipes', label: 'Recetas', icon: 'pi pi-book', to: { name: 'recipes' } },
  { key: 'stores', label: 'Tiendas', icon: 'pi pi-shop', to: { name: 'market' } },
  {
    key: 'products',
    label: 'Productos',
    icon: 'pi pi-shopping-cart',
    to: { name: 'market', query: { tab: 'products' } },
  },
] as const
</script>

<template>
  <section class="admin container">
    <header class="admin__header">
      <span class="admin__eyebrow"
        ><i class="pi pi-shield" aria-hidden="true" /> Administración</span
      >
      <h1>Hola, {{ auth.user?.firstName }}</h1>
      <p>Resumen de la actividad de Mealthy.</p>
    </header>

    <div class="admin__stats">
      <RouterLink v-for="card in CARDS" :key="card.key" :to="card.to" class="stat-card">
        <span class="stat-card__icon"><i :class="card.icon" aria-hidden="true" /></span>
        <div>
          <Skeleton v-if="!stats" width="3rem" height="1.75rem" />
          <strong v-else>{{ stats[card.key] }}</strong>
          <span>{{ card.label }}</span>
        </div>
      </RouterLink>
    </div>

    <div class="admin__panel">
      <div class="admin__panel-header">
        <h2>Usuarios registrados</h2>
        <RouterLink :to="{ name: 'admin-users' }"
          >Gestionar usuarios <i class="pi pi-arrow-right" aria-hidden="true"
        /></RouterLink>
      </div>
      <ul class="admin__users">
        <template v-if="loadingUsers && !users.length">
          <li v-for="n in 5" :key="n"><Skeleton height="2.5rem" /></li>
        </template>
        <li v-for="u in users" v-else :key="u.id">
          <Avatar :label="u.initials" shape="circle" class="admin__avatar" />
          <div class="admin__user-info">
            <strong>{{ u.fullName }}</strong>
            <small>{{ u.email }}</small>
          </div>
          <RoleTag :role="u.role" />
          <small class="admin__date">{{ dateFormat.format(u.createdAt) }}</small>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.admin {
  padding-block: 2rem 3rem;
}

.admin__eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-primary-color);
}

.admin__header h1 {
  margin: 0.4rem 0 0;
  font-size: 2rem;
}

.admin__header p {
  margin: 0.25rem 0 1.5rem;
  color: var(--p-text-muted-color);
}

.admin__stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  color: inherit;
  text-decoration: none;
  font-weight: 400;
  transition: border-color 0.15s;
}

.stat-card:hover {
  border-color: var(--p-primary-color);
}

.stat-card__icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--p-border-radius-lg);
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
  color: var(--p-primary-color);
  font-size: 1.3rem;
}

.stat-card strong {
  display: block;
  font-size: 1.75rem;
  line-height: 1.1;
}

.stat-card span {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

.admin__panel {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  padding: 1.25rem 1.5rem;
}

.admin__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.admin__panel-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.admin__panel-header a {
  text-decoration: none;
  font-size: 0.9rem;
}

.admin__users {
  list-style: none;
  padding: 0;
  margin: 0;
}

.admin__users li {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--p-content-border-color);
}

.admin__users li:last-child {
  border-bottom: 0;
}

.admin__avatar {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  flex-shrink: 0;
}

.admin__user-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.admin__user-info small,
.admin__date {
  color: var(--p-text-muted-color);
}

.admin__user-info small {
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 560px) {
  .admin__date {
    display: none;
  }
}
</style>
