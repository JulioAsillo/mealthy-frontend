import { api } from '@/shared/infrastructure/base-api'
import type { PagedResult } from '@/shared/domain/model/paged-result'
import type {
  CreateStoreResource,
  ProductRequestResource,
  ProductResource,
  StoreResource,
  UpdateStoreResource,
} from './marketplace.resources'

export interface ProductQuery {
  page?: number
  pageSize?: number
  search?: string
  category?: string
}

const clean = <T extends object>(params: T) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined))

export const storesApi = {
  list: (params: { page?: number; pageSize?: number; search?: string }, signal?: AbortSignal) =>
    api.get<PagedResult<StoreResource>>('/stores', { params: clean(params), signal }),

  getById: (id: number) => api.get<StoreResource>(`/stores/${id}`),

  /** 404 = el dueño aún no registró su tienda. */
  getMine: () => api.get<StoreResource>('/stores/me'),

  create: (body: CreateStoreResource) =>
    api.post<StoreResource, CreateStoreResource>('/stores', body),

  update: (id: number, body: UpdateStoreResource) =>
    api.put<StoreResource, UpdateStoreResource>(`/stores/${id}`, body),
}

export const productsApi = {
  /** Búsqueda pública en todas las tiendas. */
  search: (params: ProductQuery, signal?: AbortSignal) =>
    api.get<PagedResult<ProductResource>>('/products', { params: clean(params), signal }),

  listByStore: (storeId: number, params: ProductQuery, signal?: AbortSignal) =>
    api.get<PagedResult<ProductResource>>(`/stores/${storeId}/products`, {
      params: clean(params),
      signal,
    }),

  create: (storeId: number, body: ProductRequestResource) =>
    api.post<ProductResource, ProductRequestResource>(`/stores/${storeId}/products`, body),

  update: (storeId: number, id: number, body: ProductRequestResource) =>
    api.put<ProductResource, ProductRequestResource>(`/stores/${storeId}/products/${id}`, body),

  remove: (storeId: number, id: number) => api.delete(`/stores/${storeId}/products/${id}`),
}
