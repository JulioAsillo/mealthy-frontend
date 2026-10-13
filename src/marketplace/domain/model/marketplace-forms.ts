export interface StoreForm {
  name: string
  description: string
  /** Solo se envía al crear: el RUC no se puede cambiar después. */
  ruc: string
  /** Id devuelto por el contexto Media al subir la foto (null = sin foto). */
  imageId: number | null
}

export interface ProductForm {
  name: string
  category: string
  price: number | null
  unit: string
  stock: number | null
  imageId: number | null
}

export const emptyStoreForm = (): StoreForm => ({
  name: '',
  description: '',
  ruc: '',
  imageId: null,
})

export const emptyProductForm = (): ProductForm => ({
  name: '',
  category: '',
  price: null,
  unit: 'unid',
  stock: 0,
  imageId: null,
})
