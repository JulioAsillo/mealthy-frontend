import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    /** Título de la pestaña del navegador */
    title?: string
    /** Requiere sesión iniciada (Fase 3) */
    requiresAuth?: boolean
    /** Solo para usuarios sin sesión: sign-in, sign-up (Fase 3) */
    guestOnly?: boolean
  }
}

export {}
