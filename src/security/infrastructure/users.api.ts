import { api } from '@/shared/infrastructure/base-api'
import type { UpdateProfileResource, UserResource } from './auth.resources'

export const usersApi = {
  getMe: () => api.get<UserResource>('/users/me'),

  updateMe: (body: UpdateProfileResource) =>
    api.put<UserResource, UpdateProfileResource>('/users/me', body),
}
