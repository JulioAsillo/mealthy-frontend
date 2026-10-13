import { api } from '@/shared/infrastructure/base-api'
import { ApiError } from '@/shared/domain/model/api-error'
import type { ImageVariant } from '@/media/domain/model/image.entity'
import type {
  CreateImageUploadResource,
  ImageResource,
  ImageUploadResource,
} from './media.resources'

export const mediaApi = {
  createUpload: (body: CreateImageUploadResource) =>
    api.post<ImageUploadResource, CreateImageUploadResource>('/images', body),

  complete: (id: number) => api.post<ImageResource>(`/images/${id}/complete`),

  /** silent: el sondeo de estado no debe encender la barra de carga global. */
  getById: (id: number, signal?: AbortSignal) =>
    api.get<ImageResource>(`/images/${id}`, { silent: true, signal }),

  /**
   * PUT directo a Blob Storage con la URL SAS.
   * fetch nativo a propósito: el cliente axios añade "Authorization: Bearer …" y ese token
   * NO debe viajar a un servicio que no es la API (y el storage lo rechazaría).
   */
  async uploadToStorage(
    url: string,
    headers: Record<string, string>,
    file: Blob,
    signal?: AbortSignal,
  ): Promise<void> {
    let response: Response
    try {
      response = await fetch(url, { method: 'PUT', headers, body: file, signal })
    } catch {
      throw new ApiError({ status: 0, title: 'No se pudo conectar con el almacenamiento' })
    }
    if (!response.ok) {
      throw new ApiError({ status: response.status, title: 'No se pudo subir la imagen' })
    }
  },
}

/**
 * URL estable para <img src>: la API responde 302 hacia el WebP en Blob Storage.
 * Si el storage cambia (CDN, otra cuenta), esta URL sigue siendo la misma.
 */
export function imageContentUrl(id: number, variant: ImageVariant): string {
  return `${import.meta.env.VITE_API_BASE_URL}/images/${id}/content?size=${variant}`
}
