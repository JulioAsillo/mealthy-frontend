/** Espejo de Media/Domain del backend. */
export type ImageStatus = 'AwaitingUpload' | 'Processing' | 'Ready' | 'Failed'

/** Tamaños que genera el backend (lado mayor): sm 320 px, md 800 px, lg 1600 px. */
export type ImageVariant = 'sm' | 'md' | 'lg'

export interface StoredImage {
  id: number
  status: ImageStatus
  width: number | null
  height: number | null
  failureReason: string | null
}

/** Mismos límites que MediaOptions del backend. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export type AcceptedImageType = (typeof ACCEPTED_IMAGE_TYPES)[number]

export const isAcceptedImageType = (type: string): type is AcceptedImageType =>
  (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(type)
