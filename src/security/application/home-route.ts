import type { RouteLocationRaw } from 'vue-router'
import type { Role } from '@/security/domain/model/role'

/**
 * Página de inicio de cada rol tras iniciar sesión.
 * Fase 6: StoreOwner → my-store. Fase Admin: Admin → admin-dashboard.
 */
export function homeRouteFor(role: Role | null): RouteLocationRaw {
  switch (role) {
    case 'Customer':
    case 'StoreOwner':
    case 'Admin':
      return { name: 'recipes' }
    default:
      return { name: 'home' }
  }
}
