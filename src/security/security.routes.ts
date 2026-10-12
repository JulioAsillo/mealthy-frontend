import type { RouteRecordRaw } from 'vue-router'

/** Rutas solo para visitantes sin sesión. */
export const securityPublicRoutes: RouteRecordRaw[] = [
  {
    path: 'sign-in',
    name: 'sign-in',
    component: () => import('./presentation/views/SignInView.vue'),
    meta: { title: 'Iniciar sesión', guestOnly: true },
  },
  {
    path: 'sign-up',
    name: 'sign-up',
    component: () => import('./presentation/views/SignUpView.vue'),
    meta: { title: 'Crear cuenta', guestOnly: true },
  },
]

/** Rutas que exigen sesión. */
export const securityPrivateRoutes: RouteRecordRaw[] = [
  {
    path: 'profile',
    name: 'profile',
    component: () => import('./presentation/views/ProfileView.vue'),
    meta: { title: 'Mi perfil', requiresAuth: true },
  },
]
