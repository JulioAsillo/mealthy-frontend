import { isAxiosError } from 'axios'
import { ApiError, type ValidationErrors } from '@/shared/domain/model/api-error'

/** RFC 7807 (+ errors de ValidationProblemDetails). */
interface ProblemDetailsBody {
  type?: string
  title?: string
  status?: number
  detail?: string | null
  errors?: ValidationErrors
}

const DEFAULT_TITLES: Record<number, string> = {
  400: 'Solicitud inválida',
  401: 'No autenticado',
  403: 'Acceso denegado',
  404: 'Recurso no encontrado',
  409: 'Conflicto',
  412: 'Alguien modificó este recurso antes que tú. Recarga para ver los cambios.',
  429: 'Demasiadas solicitudes, intenta en unos segundos',
  500: 'Error interno del servidor',
}

function isProblemDetails(data: unknown): data is ProblemDetailsBody {
  return typeof data === 'object' && data !== null && ('title' in data || 'status' in data)
}

/** Convierte cualquier error (Axios, red, código) en un ApiError uniforme. */
export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (isAxiosError(error)) {
    // Sin respuesta: red caída, CORS bloqueado, certificado no confiable o timeout.
    if (!error.response) {
      const timedOut = error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT'
      return new ApiError({
        status: 0,
        title: timedOut
          ? 'El servidor tardó demasiado en responder'
          : 'No se pudo conectar con el servidor',
      })
    }

    const { status, data } = error.response
    const fallbackTitle = DEFAULT_TITLES[status] ?? `Error ${status}`

    if (isProblemDetails(data)) {
      return new ApiError({
        status: data.status ?? status,
        title: data.title ?? fallbackTitle,
        detail: data.detail ?? undefined,
        errors: data.errors,
      })
    }

    return new ApiError({ status, title: fallbackTitle })
  }

  return new ApiError({
    status: 500,
    title: 'Error inesperado',
    detail: error instanceof Error ? error.message : undefined,
  })
}
