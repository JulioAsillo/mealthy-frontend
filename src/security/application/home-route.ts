import type { RouteLocationRaw } from 'vue-router'
import type { Role } from '@/security/domain/model/role'

/**
 * Página de inicio de cada rol tras iniciar sesión.
 * Fases 4-6 la cambiarán a recipes / my-store cuando existan esas vistas.
 */
export function homeRouteFor(role: Role | null): RouteLocationRaw {
  switch (role) {
    case 'Customer':
    case 'StoreOwner':
    case 'Admin':
      return { name: 'profile' }
    default:
      return { name: 'home' }
  }
}
