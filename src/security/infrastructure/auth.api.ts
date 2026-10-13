import type { AxiosRequestConfig } from 'axios'
import { api } from '@/shared/infrastructure/base-api'
import type { AuthResource, SignInResource, SignUpResource } from './auth.resources'

/**
 * - skipAuthRefresh: un 401 en /auth significa credenciales o sesión inválidas; nunca reintentar con refresh.
 * - withCredentials: el refresh token viaja en una cookie HttpOnly. En peticiones a otro origen
 *   (front :5173 → API :5231) el navegador solo guarda y envía cookies si se pide explícitamente.
 *   Solo /auth lo necesita: el resto de la API se autentica con el Bearer.
 */
const AUTH_CONFIG: AxiosRequestConfig = { skipAuthRefresh: true, withCredentials: true }

export const authApi = {
  signIn: (body: SignInResource) =>
    api.post<AuthResource, SignInResource>('/auth/sign-in', body, AUTH_CONFIG),

  signUp: (body: SignUpResource) =>
    api.post<AuthResource, SignUpResource>('/auth/sign-up', body, AUTH_CONFIG),

  /** Sin body: el backend lee la cookie y la rota. */
  refresh: () =>
    api.post<AuthResource>('/auth/refresh', undefined, { ...AUTH_CONFIG, silent: true }),

  signOut: () => api.post<void>('/auth/sign-out', undefined, { ...AUTH_CONFIG, silent: true }),
}
