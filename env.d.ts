/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** URL base del backend Mealthy, incluye versión. Ej: https://localhost:7205/api/v1 */
  readonly VITE_API_BASE_URL: string
  /** Timeout de peticiones HTTP en milisegundos */
  readonly VITE_API_TIMEOUT_MS: string
  /** Nombre de la app mostrado en títulos */
  readonly VITE_APP_NAME: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
