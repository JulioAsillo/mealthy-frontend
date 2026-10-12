import 'vue-router'
import type { Role } from '@/security/domain/model/role'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título de la pestaña del navegador */
    title?: string
    /** Requiere sesión iniciada */
    requiresAuth?: boolean
    /** Solo para usuarios sin sesión: sign-in, sign-up */
    guestOnly?: boolean
    /** Roles permitidos; vacío = cualquier usuario autenticado */
    roles?: Role[]
  }
}

export {}
