import { watch } from 'vue'
import type { Pinia } from 'pinia'
import type { Router } from 'vue-router'
import { registerHttpHooks } from '@/shared/infrastructure/http-client'
import { useAuthStore } from './auth.store'
import { usePantryStore } from '@/pantry/application/pantry.store'
import { useMyStoreStore } from '@/marketplace/application/my-store.store'
import { useAdminStore } from '@/admin/application/admin.store'

/**
 * Conecta el contexto Security con el cliente HTTP compartido:
 * - refreshAccessToken: el interceptor lo llama ante un 401.
 * - onSessionExpired: si el refresh falla, se limpia la sesión y se manda al login.
 * - Limpia los stores con datos personales al cambiar de usuario.
 */
export function setupAuth(pinia: Pinia, router: Router): void {
  const auth = useAuthStore(pinia)

  // Al cambiar de usuario (logout o login con otra cuenta) se limpian los datos personales.
  watch(
    () => auth.user?.id,
    (current, previous) => {
      if (previous === undefined || current === previous) return
      usePantryStore(pinia).$reset()
      useMyStoreStore(pinia).$reset()
      useAdminStore(pinia).$reset()
    },
  )

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
