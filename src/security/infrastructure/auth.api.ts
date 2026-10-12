import type { AxiosRequestConfig } from 'axios'
import { api } from '@/shared/infrastructure/base-api'
import type {
  AuthResource,
  RefreshTokenResource,
  SignInResource,
  SignUpResource,
} from './auth.resources'

/** Un 401 en /auth significa credenciales o refresh inválidos: nunca reintentar con refresh. */
const AUTH_CONFIG: AxiosRequestConfig = { skipAuthRefresh: true }

export const authApi = {
  signIn: (body: SignInResource) =>
    api.post<AuthResource, SignInResource>('/auth/sign-in', body, AUTH_CONFIG),

  signUp: (body: SignUpResource) =>
    api.post<AuthResource, SignUpResource>('/auth/sign-up', body, AUTH_CONFIG),

  refresh: (refreshToken: string) =>
    api.post<AuthResource, RefreshTokenResource>(
      '/auth/refresh',
      { refreshToken },
      { ...AUTH_CONFIG, silent: true },
    ),

  signOut: (refreshToken: string) =>
    api.post<void, RefreshTokenResource>(
      '/auth/sign-out',
      { refreshToken },
      { ...AUTH_CONFIG, silent: true },
    ),
}
