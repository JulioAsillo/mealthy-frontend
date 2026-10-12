import { useToast } from 'primevue/usetoast'
import { ApiError } from '@/shared/domain/model/api-error'

/** Notificaciones consistentes para toda la app. */
export function useNotify() {
  const toast = useToast()

  return {
    success(summary: string, detail?: string) {
      toast.add({ severity: 'success', summary, detail, life: 3000 })
    },
    info(summary: string, detail?: string) {
      toast.add({ severity: 'info', summary, detail, life: 3000 })
    },
    /** Muestra un error del backend. Los de red y 5xx ya los notifica el cliente HTTP. */
    error(error: unknown, fallback = 'Ocurrió un error') {
      if (error instanceof ApiError) {
        if (error.isNetworkError || error.status >= 500) return
        toast.add({
          severity: 'error',
          summary: error.title,
          detail: error.userMessage,
          life: 5000,
        })
        return
      }
      toast.add({ severity: 'error', summary: fallback, life: 5000 })
    },
  }
}
