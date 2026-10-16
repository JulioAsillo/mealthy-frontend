import type { ApiSchema } from '@/shared/infrastructure/openapi/api-schema'

/** DTOs de Media, generados desde el OpenAPI del backend (no editar a mano: npm run api:types). */

export type ImageResource = ApiSchema<'ImageResponse'>
export type CreateImageUploadResource = ApiSchema<'CreateImageUploadRequest'>

/** uploadUrl es una URL SAS de Blob Storage: el PUT va directo al storage, no a la API. */
export type ImageUploadResource = ApiSchema<'ImageUploadResponse'>
