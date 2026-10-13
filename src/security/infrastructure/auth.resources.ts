import type { Role } from '@/security/domain/model/role'

/** DTOs tal como viajan por la red (espejo de Interfaces/Rest/Resources del backend). */

export interface UserResource {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  birthDate: string | null
  role: Role
  createdAt: string
}

/** El refresh token no viene aquí: el backend lo deja en una cookie HttpOnly. */
export interface AuthResource {
  token: string
  expiresAt: string
  user: UserResource
}

export interface SignInResource {
  email: string
  password: string
}

export interface SignUpResource {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string | null
  birthDate: string | null
  role: Role
}

export interface UpdateProfileResource {
  firstName: string
  lastName: string
  phone: string | null
  birthDate: string | null
}
