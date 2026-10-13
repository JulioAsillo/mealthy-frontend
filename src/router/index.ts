import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import AppLayout from '@/shared/presentation/layouts/AppLayout.vue'
import { securityPrivateRoutes, securityPublicRoutes } from '@/security/security.routes'
import { recipesRoutes } from '@/recipes/recipes.routes'
import { pantryRoutes } from '@/pantry/pantry.routes'
import { marketplaceRoutes } from '@/marketplace/marketplace.routes'
import { adminRoutes } from '@/admin/admin.routes'

/**
 * Un solo layout. Cada bounded context aporta sus rutas desde <contexto>.routes.ts;
 * la protección va en meta de cada ruta (requiresAuth / guestOnly / roles).
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/shared/presentation/views/HomeView.vue'),
        meta: { title: 'Inicio' },
      },
      ...securityPublicRoutes,
      ...securityPrivateRoutes,
      ...recipesRoutes,
      ...pantryRoutes,
      ...marketplaceRoutes,
      ...adminRoutes,
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
  scrollBehavior: (_to, _from, saved) => saved ?? { top: 0 },
})

router.afterEach((to) => {
  const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
  document.title = to.meta.title ? `${to.meta.title} · ${appName}` : appName
})

export default router
