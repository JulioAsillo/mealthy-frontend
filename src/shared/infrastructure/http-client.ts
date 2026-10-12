import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { ApiError } from '@/shared/domain/model/api-error'
import { toApiError } from './problem-details'
import { tokenStorage } from './token-storage'

declare module 'axios' {
  interface AxiosRequestConfig {
    /** No dispara el refresh ante un 401 (ej. el propio sign-in o refresh). */
    skipAuthRefresh?: boolean
    /** No cuenta para el indicador de carga global. */
    silent?: boolean
    /** Uso interno: la petición ya fue reintentada tras un refresh. */
    _retried?: boolean
  }
}

/**
 * Ganchos que la capa de aplicación registra en el arranque.
 * Así la infraestructura no depende de Pinia ni de Vue (regla de dependencias).
 */
export interface HttpHooks {
  /** Devuelve un access token nuevo o null si la sesión no se puede renovar. */
  refreshAccessToken?: () => Promise<string | null>
  /** La sesión expiró y no se pudo renovar. */
  onSessionExpired?: () => void
  onRequestStart?: () => void
  onRequestEnd?: () => void
  /** Errores que nadie más debería tener que manejar (red caída, 5xx). */
  onUnexpectedError?: (error: ApiError) => void
}

let hooks: HttpHooks = {}

export function registerHttpHooks(newHooks: HttpHooks): void {
  hooks = { ...hooks, ...newHooks }
}

/** Una sola renovación en vuelo: los 401 concurrentes esperan la misma promesa. */
let refreshInFlight: Promise<string | null> | null = null

function refreshOnce(): Promise<string | null> {
  if (!hooks.refreshAccessToken) return Promise.resolve(null)
  refreshInFlight ??= hooks
    .refreshAccessToken()
    .catch(() => null)
    .finally(() => {
      refreshInFlight = null
    })
  return refreshInFlight
}

export function createHttpClient(config: AxiosRequestConfig = {}): AxiosInstance {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    timeout: Number(import.meta.env.VITE_API_TIMEOUT_MS) || 15_000,
    headers: { Accept: 'application/json' },
    ...config,
  })

  instance.interceptors.request.use((request: InternalAxiosRequestConfig) => {
    const token = tokenStorage.get()
    if (token) request.headers.set('Authorization', `Bearer ${token}`)
    if (!request.silent) hooks.onRequestStart?.()
    return request
  })

  instance.interceptors.response.use(
    (response) => {
      if (!response.config.silent) hooks.onRequestEnd?.()
      return response
    },
    async (error: unknown) => {
      const request = axios.isAxiosError(error) ? error.config : undefined
      if (request && !request.silent) hooks.onRequestEnd?.()

      // Cancelaciones (AbortController) no son errores: se propagan tal cual.
      if (axios.isCancel(error)) return Promise.reject(error)

      const apiError = toApiError(error)

      const canRefresh =
        apiError.isUnauthorized && request && !request.skipAuthRefresh && !request._retried

      if (canRefresh) {
        const newToken = await refreshOnce()
        if (newToken) {
          tokenStorage.set(newToken)
          request._retried = true
          request.headers.set('Authorization', `Bearer ${newToken}`)
          return instance.request(request)
        }
        tokenStorage.clear()
        hooks.onSessionExpired?.()
      }

      if (apiError.isNetworkError || apiError.status >= 500) {
        hooks.onUnexpectedError?.(apiError)
      }

      return Promise.reject(apiError)
    },
  )

  return instance
}

/** Cliente único de la aplicación. */
export const http = createHttpClient()

if (!import.meta.env.VITE_API_BASE_URL && import.meta.env.MODE !== 'test') {
  console.warn('[http] VITE_API_BASE_URL no está definida. Revisa tu archivo .env')
}
