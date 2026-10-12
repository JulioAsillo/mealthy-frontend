import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { registerHttpHooks } from '@/shared/infrastructure/http-client'
import { useAuthStore } from './auth.store'

/**
 * Conecta el contexto Security con el cliente HTTP compartido:
 * - refreshAccessToken: el interceptor lo llama ante un 401.
 * - onSessionExpired: si el refresh falla, se limpia la sesión y se manda al login.
 */
export function setupAuth(pinia: Pinia, router: Router): void {
  const auth = useAuthStore(pinia)

  registerHttpHooks({
    refreshAccessToken: auth.refreshAccessToken,
    onSessionExpired: () => {
      auth.clearSession()
      const current = router.currentRoute.value
      if (current.meta.requiresAuth) {
        void router.push({ name: 'sign-in', query: { redirect: current.fullPath } })
      }
    },
  })
}
