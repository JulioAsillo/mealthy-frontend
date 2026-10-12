import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { ApiError } from '@/shared/domain/model/api-error'
import type { Product, Store } from '@/marketplace/domain/model/marketplace.entity'
import type { ProductForm, StoreForm } from '@/marketplace/domain/model/marketplace-forms'
import { productsApi, storesApi } from '@/marketplace/infrastructure/marketplace.api'
import { MarketplaceAssembler } from '@/marketplace/infrastructure/marketplace.assembler'

const PAGE_SIZE = 100
const MAX_PAGES = 10

/** Tienda y catálogo del dueño autenticado. */
export const useMyStoreStore = defineStore('my-store', () => {
  const store = ref<Store | null>(null)
  const products = ref<Product[]>([])
  /** null = aún no se consultó; false = el dueño no tiene tienda. */
  const hasStore = ref<boolean | null>(null)
  const loading = ref(false)

  const stats = computed(() => ({
    total: products.value.length,
    outOfStock: products.value.filter((p) => p.stock <= 0).length,
    inventoryValue: products.value.reduce((sum, p) => sum + p.price * p.stock, 0),
  }))

  async function load(): Promise<void> {
    loading.value = true
    try {
      store.value = MarketplaceAssembler.toStore(await storesApi.getMine())
      hasStore.value = true
      await loadProducts()
    } catch (e) {
      if (e instanceof ApiError && e.isNotFound) {
        store.value = null
        products.value = []
        hasStore.value = false
        return
      }
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadProducts(): Promise<void> {
    if (!store.value) return
    const all: Product[] = []
    for (let page = 1; page <= MAX_PAGES; page++) {
      const result = await productsApi.listByStore(store.value.id, { page, pageSize: PAGE_SIZE })
      all.push(...result.items.map(MarketplaceAssembler.toProduct))
      if (all.length >= result.totalItems || result.items.length < PAGE_SIZE) break
    }
    products.value = all
  }

  async function createStore(form: StoreForm): Promise<void> {
    store.value = MarketplaceAssembler.toStore(
      await storesApi.create(MarketplaceAssembler.toCreateStore(form)),
    )
    hasStore.value = true
    products.value = []
  }

  async function updateStore(form: StoreForm): Promise<void> {
    if (!store.value) return
    store.value = MarketplaceAssembler.toStore(
      await storesApi.update(store.value.id, MarketplaceAssembler.toUpdateStore(form)),
    )
  }

  async function saveProduct(form: ProductForm, productId?: number): Promise<Product> {
    if (!store.value) throw new Error('No hay tienda registrada')
    const body = MarketplaceAssembler.toProductRequest(form)
    const saved = MarketplaceAssembler.toProduct(
      productId
        ? await productsApi.update(store.value.id, productId, body)
        : await productsApi.create(store.value.id, body),
    )
    products.value = productId
      ? products.value.map((p) => (p.id === productId ? saved : p))
      : [saved, ...products.value]
    return saved
  }

  async function removeProduct(id: number): Promise<void> {
    if (!store.value) return
    const snapshot = products.value
    products.value = products.value.filter((p) => p.id !== id)
    try {
      await productsApi.remove(store.value.id, id)
    } catch (e) {
      products.value = snapshot
      throw e
    }
  }

  function $reset() {
    store.value = null
    products.value = []
    hasStore.value = null
  }

  return {
    store,
    products,
    hasStore,
    loading,
    stats,
    load,
    createStore,
    updateStore,
    saveProduct,
    removeProduct,
    $reset,
  }
})
