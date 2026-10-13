import type { RouteLocationRaw } from 'vue-router'
import type { Role } from '@/security/domain/model/role'

/**
 * Página de inicio de cada rol tras iniciar sesión.
 */
export function homeRouteFor(role: Role | null): RouteLocationRaw {
  switch (role) {
    case 'StoreOwner':
      return { name: 'my-store' }
    case 'Admin':
      return { name: 'admin-dashboard' }
    case 'Customer':
      return { name: 'recipes' }
    default:
      return { name: 'home' }
  }
}
