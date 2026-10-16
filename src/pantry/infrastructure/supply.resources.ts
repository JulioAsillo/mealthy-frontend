import type { ApiSchema } from '@/shared/infrastructure/openapi/api-schema'

/** DTOs de Pantry, generados desde el OpenAPI del backend (no editar a mano: npm run api:types). */

export type SupplyResource = ApiSchema<'SupplyResponse'>
export type SupplyRequestResource = ApiSchema<'SupplyRequest'>
