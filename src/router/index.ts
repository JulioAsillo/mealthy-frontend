import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * Rutas raíz. Cada bounded context aportará sus rutas en <contexto>.routes.ts
 * (security, recipes, pantry, marketplace) a partir de la Fase 3.
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/shared/presentation/views/HomeView.vue'),
    meta: { title: 'Inicio' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/shared/presentation/views/NotFoundView.vue'),
    meta: { title: 'Página no encontrada' },
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
