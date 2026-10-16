import type { ApiSchema } from '@/shared/infrastructure/openapi/api-schema'

/** DTOs de Marketplace, generados desde el OpenAPI del backend (no editar a mano: npm run api:types). */

export type StoreResource = ApiSchema<'StoreResponse'>
export type CreateStoreResource = ApiSchema<'CreateStoreRequest'>
export type UpdateStoreResource = ApiSchema<'UpdateStoreRequest'>

export type ProductResource = ApiSchema<'ProductResponse'>
export type ProductRequestResource = ApiSchema<'ProductRequest'>
