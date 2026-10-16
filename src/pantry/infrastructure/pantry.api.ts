import { api } from '@/shared/infrastructure/base-api'
import { idempotent, ifMatch } from '@/shared/infrastructure/request-headers'
import type { PagedResult } from '@/shared/domain/model/paged-result'
import type { SupplyRequestResource, SupplyResource } from './supply.resources'

/** Máximo que acepta el backend (PageQuery.MaxPageSize). */
export const PANTRY_MAX_PAGE_SIZE = 100

export const pantryApi = {
  list: (page: number, pageSize = PANTRY_MAX_PAGE_SIZE) =>
    api.get<PagedResult<SupplyResource>>('/pantry', { params: { page, pageSize } }),

  create: (body: SupplyRequestResource, idempotencyKey?: string) =>
    api.post<SupplyResource, SupplyRequestResource>('/pantry', body, idempotent(idempotencyKey)),

  update: (id: number, body: SupplyRequestResource, version?: number) =>
    api.put<SupplyResource, SupplyRequestResource>(`/pantry/${id}`, body, ifMatch(version)),

  remove: (id: number) => api.delete(`/pantry/${id}`),
}
