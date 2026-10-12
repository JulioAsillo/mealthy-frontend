export interface StoreForm {
  name: string
  description: string
  /** Solo se envía al crear: el RUC no se puede cambiar después. */
  ruc: string
  photoUrl: string
}

export interface ProductForm {
  name: string
  category: string
  price: number | null
  unit: string
  stock: number | null
  photoUrl: string
}

export const emptyStoreForm = (): StoreForm => ({
  name: '',
  description: '',
  ruc: '',
  photoUrl: '',
})

export const emptyProductForm = (): ProductForm => ({
  name: '',
  category: '',
  price: null,
  unit: 'unid',
  stock: 0,
  photoUrl: '',
})
