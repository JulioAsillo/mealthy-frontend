import { ref } from 'vue'
import { ApiError } from '@/shared/domain/model/api-error'

/**
 * Estado común de un formulario que llama al backend:
 * envío en curso, error del servidor y errores por campo.
 */
export function useApiForm() {
  const submitting = ref(false)
  const error = ref<ApiError | null>(null)

  /** Ejecuta la acción; devuelve true si terminó bien. */
  async function submit(action: () => Promise<unknown>): Promise<boolean> {
    if (submitting.value) return false
    submitting.value = true
    error.value = null
    try {
      await action()
      return true
    } catch (e) {
      error.value =
        e instanceof ApiError ? e : new ApiError({ status: 500, title: 'Error inesperado' })
      return false
    } finally {
      submitting.value = false
    }
  }

  function fieldError(field: string): string | undefined {
    return error.value?.fieldError(field)
  }

  /** Mensaje general (no asociado a un campo) para mostrar arriba del formulario. */
  function generalError(): string | undefined {
    const e = error.value
    if (!e || e.isValidationError || e.isNetworkError || e.status >= 500) return undefined
    return e.userMessage
  }

  function reset() {
    error.value = null
  }

  return { submitting, error, submit, fieldError, generalError, reset }
}
