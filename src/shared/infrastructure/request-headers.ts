import type { AxiosRequestConfig } from 'axios'

/**
 * Cabeceras HTTP de control que entiende el backend (Fase 6 del roadmap 2).
 * Se combinan con la config de cada llamada: api.put(url, body, ifMatch(version)).
 */

/** Concurrencia optimista: si otro usuario guardó antes, el backend responde 412 en vez de pisar sus cambios. */
export function ifMatch(version?: number): AxiosRequestConfig {
  return version === undefined ? {} : { headers: { 'If-Match': `"${version}"` } }
}

/** Reintentar con la misma clave devuelve la respuesta original en vez de crear un duplicado. */
export function idempotent(key?: string): AxiosRequestConfig {
  return key ? { headers: { 'Idempotency-Key': key } } : {}
}

export const newIdempotencyKey = (): string => crypto.randomUUID()
