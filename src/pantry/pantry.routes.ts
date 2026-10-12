import type { RouteRecordRaw } from 'vue-router'

export const pantryRoutes: RouteRecordRaw[] = [
  {
    path: 'pantry',
    name: 'pantry',
    component: () => import('./presentation/views/PantryView.vue'),
    meta: { title: 'Mi despensa', requiresAuth: true, roles: ['Customer'] },
  },
]
