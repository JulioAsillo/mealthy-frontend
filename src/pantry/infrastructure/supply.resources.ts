/** DTOs espejo de Pantry/Interfaces/Rest/Resources del backend. */
export interface SupplyResource {
  id: number
  name: string
  quantity: number
  unit: string
  expiresOn: string | null
  createdAt: string
  updatedAt: string | null
}

export interface SupplyRequestResource {
  name: string
  quantity: number
  unit: string
  expiresOn: string | null
}
