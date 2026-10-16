/** Errores de validación tal como los devuelve ASP.NET (ValidationProblemDetails.errors). */
export type ValidationErrors = Record<string, string[]>

export interface ApiErrorInit {
  status: number
  title: string
  detail?: string
  errors?: ValidationErrors
}

/**
 * Error normalizado de cualquier llamada HTTP.
 * status = 0 → no hubo respuesta (sin red, CORS, timeout, certificado).
 */
export class ApiError extends Error {
  readonly status: number
  readonly title: string
  readonly detail?: string
  readonly errors: ValidationErrors

  constructor({ status, title, detail, errors = {} }: ApiErrorInit) {
    super(detail ?? title)
    this.name = 'ApiError'
    this.status = status
    this.title = title
    this.detail = detail
    this.errors = errors
  }

  get isNetworkError(): boolean {
    return this.status === 0
  }

  get isValidationError(): boolean {
    return Object.keys(this.errors).length > 0
  }

  get isUnauthorized(): boolean {
    return this.status === 401
  }

  get isForbidden(): boolean {
    return this.status === 403
  }

  get isNotFound(): boolean {
    return this.status === 404
  }

  /** 412 (If-Match no coincide) o 409 de concurrencia: alguien guardó antes. */
  get isStaleData(): boolean {
    return this.status === 412
  }

  /**
   * Primer mensaje de validación de un campo.
   * Insensible a mayúsculas y al prefijo "$." (ASP.NET usa "Email" o "$.email").
   */
  fieldError(field: string): string | undefined {
    const wanted = field.toLowerCase()
    const key = Object.keys(this.errors).find(
      (k) => k.replace(/^\$\./, '').toLowerCase() === wanted,
    )
    return key ? this.errors[key]?.[0] : undefined
  }

  /** Mensaje legible para mostrar al usuario. */
  get userMessage(): string {
    if (this.isValidationError) {
      return Object.values(this.errors).flat()[0] ?? this.title
    }
    return this.detail ?? this.title
  }
}
