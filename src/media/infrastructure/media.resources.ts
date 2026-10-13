import type { ImageStatus } from '@/media/domain/model/image.entity'

/** DTOs espejo de Media/Interfaces/Rest/Resources del backend. */
export interface ImageResource {
  id: number
  status: ImageStatus
  width: number | null
  height: number | null
  failureReason: string | null
  createdAt: string
}

export interface CreateImageUploadResource {
  contentType: string
  sizeBytes: number
}

export interface ImageUploadResource {
  id: number
  /** URL SAS de Blob Storage: el PUT va directo al storage, no a la API. */
  uploadUrl: string
  uploadHeaders: Record<string, string>
  expiresAt: string
}
