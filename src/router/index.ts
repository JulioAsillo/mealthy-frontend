import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import PublicLayout from '@/shared/presentation/layouts/PublicLayout.vue'
import { securityPrivateRoutes, securityPublicRoutes } from '@/security/security.routes'

/**
 * Dos layouts en la raíz:
 * - PublicLayout: home, auth, 403, 404.
 * - AppLayout: todo lo que exige sesión (meta.requiresAuth se hereda a los hijos).
 * Cada bounded context aporta sus rutas desde <contexto>.routes.ts.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/shared/presentation/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [...securityPrivateRoutes],
  },
  {
    path: '/',
    component: PublicLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/shared/presentation/views/HomeView.vue'),
        meta: { title: 'Inicio' },
      },
      ...securityPublicRoutes,
      {
        path: 'forbidden',
        name: 'forbidden',
        component: () => import('@/shared/presentation/views/ForbiddenView.vue'),
        meta: { title: 'Acceso denegado' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/shared/presentation/views/NotFoundView.vue'),
        meta: { title: 'Página no encontrada' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
  document.title = to.meta.title ? `${to.meta.title} · ${appName}` : appName
})

export default router
