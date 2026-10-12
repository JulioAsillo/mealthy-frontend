import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import { http } from './http-client'

/**
 * Atajos tipados que devuelven directamente el body.
 * Los *.api.ts de cada contexto se construyen sobre esto.
 */
export function createApi(client: AxiosInstance = http) {
  return {
    get: <T>(url: string, config?: AxiosRequestConfig) =>
      client.get<T>(url, config).then((r) => r.data),
    post: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
      client.post<T>(url, body, config).then((r) => r.data),
    put: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
      client.put<T>(url, body, config).then((r) => r.data),
    patch: <T, B = unknown>(url: string, body?: B, config?: AxiosRequestConfig) =>
      client.patch<T>(url, body, config).then((r) => r.data),
    delete: <T = void>(url: string, config?: AxiosRequestConfig) =>
      client.delete<T>(url, config).then((r) => r.data),
  }
}

export const api = createApi()
export type Api = ReturnType<typeof createApi>
