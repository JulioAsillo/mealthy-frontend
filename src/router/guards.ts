import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { useAuthStore } from '@/security/application/auth.store'
import { homeRouteFor } from '@/security/application/home-route'

/**
 * Se registra ANTES de app.use(router), para que también proteja la navegación inicial.
 * meta se hereda de las rutas padre (requiresAuth vive en el layout).
 */
export function installGuards(router: Router, pinia: Pinia): void {
  router.beforeEach(async (to) => {
    const auth = useAuthStore(pinia)
    await auth.initialize()

    if (to.meta.guestOnly && auth.isAuthenticated) {
      return homeRouteFor(auth.role)
    }

    if (to.meta.requiresAuth && !auth.isAuthenticated) {
      return { name: 'sign-in', query: { redirect: to.fullPath } }
    }

    const roles = to.meta.roles
    if (roles?.length && !auth.hasRole(...roles)) {
      return { name: 'forbidden' }
    }

    return true
  })
}
