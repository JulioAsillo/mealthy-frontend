import { api } from '@/shared/infrastructure/base-api'
import type { PagedResult } from '@/shared/domain/model/paged-result'
import type { UserResource } from '@/security/infrastructure/auth.resources'

/** Endpoints con [Authorize(Policy = AdminOnly)] + conteos públicos para el dashboard. */
export const adminApi = {
  listUsers: (page: number, pageSize: number) =>
    api.get<PagedResult<UserResource>>('/users', { params: { page, pageSize } }),

  getUser: (id: number) => api.get<UserResource>(`/users/${id}`),

  deleteUser: (id: number) => api.delete(`/users/${id}`),

  /** Solo interesa totalItems: se pide 1 elemento por eficiencia. */
  count: async (resource: '/users' | '/recipes' | '/stores' | '/products') =>
    (await api.get<PagedResult<unknown>>(resource, { params: { page: 1, pageSize: 1 } }))
      .totalItems,
}
