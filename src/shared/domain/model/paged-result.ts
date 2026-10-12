/** Espejo de Shared/Application/PagedResult del backend. */
export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

export interface PageQuery {
  page?: number
  pageSize?: number
}
