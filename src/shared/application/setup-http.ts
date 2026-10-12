import type { App } from 'vue'
import type { Pinia } from 'pinia'
import { registerHttpHooks } from '@/shared/infrastructure/http-client'
import { useUiStore } from './ui.store'

/**
 * Conecta el cliente HTTP con la capa de aplicación.
 * Se llama una vez en main.ts, después de instalar Pinia y ToastService.
 * La Fase 3 añadirá aquí refreshAccessToken y onSessionExpired.
 */
export function setupHttp(app: App, pinia: Pinia): void {
  const ui = useUiStore(pinia)
  const toast = app.config.globalProperties.$toast

  registerHttpHooks({
    onRequestStart: ui.requestStarted,
    onRequestEnd: ui.requestFinished,
    onUnexpectedError: (error) =>
      toast.add({
        severity: 'error',
        summary: error.title,
        detail: error.isNetworkError
          ? 'Verifica que el backend esté corriendo y que su certificado HTTPS sea de confianza.'
          : error.detail,
        life: 5000,
      }),
  })
}
