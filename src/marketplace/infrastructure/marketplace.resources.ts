/** DTOs espejo de Marketplace/Interfaces/Rest/Resources del backend. */
export interface StoreResource {
  id: number
  name: string
  description: string
  ruc: string
  photoUrl: string | null
  ownerId: number
  createdAt: string
}

export interface CreateStoreResource {
  name: string
  description: string
  ruc: string
  photoUrl: string | null
}

export type UpdateStoreResource = Omit<CreateStoreResource, 'ruc'>

export interface ProductResource {
  id: number
  storeId: number
  name: string
  category: string
  price: number
  unit: string
  stock: number
  photoUrl: string | null
  createdAt: string
  updatedAt: string | null
}

export interface ProductRequestResource {
  name: string
  category: string
  price: number
  unit: string
  stock: number
  photoUrl: string | null
}
