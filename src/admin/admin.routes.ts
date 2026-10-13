import type { RouteRecordRaw } from 'vue-router'

export const adminRoutes: RouteRecordRaw[] = [
  {
    path: 'admin',
    name: 'admin-dashboard',
    component: () => import('./presentation/views/AdminDashboardView.vue'),
    meta: { title: 'Panel de administración', requiresAuth: true, roles: ['Admin'] },
  },
  {
    path: 'admin/users',
    name: 'admin-users',
    component: () => import('./presentation/views/AdminUsersView.vue'),
    meta: { title: 'Usuarios', requiresAuth: true, roles: ['Admin'] },
  },
]
