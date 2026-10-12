export interface Store {
  id: number
  name: string
  description: string
  ruc: string
  photoUrl: string | null
  ownerId: number
  createdAt: Date
}

export interface Product {
  id: number
  storeId: number
  name: string
  category: string
  price: number
  unit: string
  stock: number
  photoUrl: string | null
  createdAt: Date
  updatedAt: Date | null
}

/** Categorías sugeridas (el backend acepta texto libre de 2-50 caracteres). */
export const PRODUCT_CATEGORIES = [
  'Frutas',
  'Verduras',
  'Lácteos',
  'Granos y cereales',
  'Carnes y pescados',
  'Panadería',
  'Bebidas',
  'Snacks saludables',
  'Otros',
] as const

/** Stock en o por debajo de este valor se marca como "pocas unidades". */
export const LOW_STOCK = 5

export type StockStatus = 'out' | 'low' | 'ok'

export function stockStatus(product: Pick<Product, 'stock'>): StockStatus {
  if (product.stock <= 0) return 'out'
  if (product.stock <= LOW_STOCK) return 'low'
  return 'ok'
}

const PEN = new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' })
export const formatPrice = (value: number): string => PEN.format(value)

/** RUC peruano: 11 dígitos que empiezan en 10, 15, 17 o 20 (mismo regex que el backend). */
export const RUC_PATTERN = /^(10|15|17|20)\d{9}$/
