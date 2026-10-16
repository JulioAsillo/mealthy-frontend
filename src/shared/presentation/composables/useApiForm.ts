import { ref } from 'vue'
import { ApiError } from '@/shared/domain/model/api-error'
import { newIdempotencyKey } from '@/shared/infrastructure/request-headers'

/**
 * Estado común de un formulario que llama al backend:
 * envío en curso, error del servidor y errores por campo.
 */
export function useApiForm() {
  const submitting = ref(false)
  const error = ref<ApiError | null>(null)
  /**
   * Clave del envío en curso. Se conserva entre reintentos del MISMO formulario (si el primer intento
   * llegó al servidor pero la respuesta se perdió, el reintento no crea un duplicado) y se renueva
   * cuando el envío termina bien o el formulario se reinicia.
   */
  const idempotencyKey = ref(newIdempotencyKey())

  /** Ejecuta la acción; devuelve true si terminó bien. */
  async function submit(action: () => Promise<unknown>): Promise<boolean> {
    if (submitting.value) return false
    submitting.value = true
    error.value = null
    try {
      await action()
      idempotencyKey.value = newIdempotencyKey()
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
    idempotencyKey.value = newIdempotencyKey()
  }

  return { submitting, error, idempotencyKey, submit, fieldError, generalError, reset }
}
