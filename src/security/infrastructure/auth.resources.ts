import type { ApiSchema } from '@/shared/infrastructure/openapi/api-schema'

/** DTOs de Security, generados desde el OpenAPI del backend (no editar a mano: npm run api:types). */

export type UserResource = ApiSchema<'UserResponse'>

/** El refresh token no viene aquí: el backend lo deja en una cookie HttpOnly. */
export type AuthResource = ApiSchema<'AuthResponse'>

export type SignInResource = ApiSchema<'SignInRequest'>
export type SignUpResource = ApiSchema<'SignUpRequest'>
export type UpdateProfileResource = ApiSchema<'UpdateProfileRequest'>
