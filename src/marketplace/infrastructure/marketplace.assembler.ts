import type { PagedResult } from '@/shared/domain/model/paged-result'
import type { Product, Store } from '@/marketplace/domain/model/marketplace.entity'
import type { ProductForm, StoreForm } from '@/marketplace/domain/model/marketplace-forms'
import type {
  CreateStoreResource,
  ProductRequestResource,
  ProductResource,
  StoreResource,
  UpdateStoreResource,
} from './marketplace.resources'

const nullIfEmpty = (v: string) => v.trim() || null

export const MarketplaceAssembler = {
  toStore(r: StoreResource): Store {
    return { ...r, createdAt: new Date(r.createdAt) }
  },

  toProduct(r: ProductResource): Product {
    return {
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
    }
  },

  toStorePage(p: PagedResult<StoreResource>): PagedResult<Store> {
    return { ...p, items: p.items.map(MarketplaceAssembler.toStore) }
  },

  toProductPage(p: PagedResult<ProductResource>): PagedResult<Product> {
    return { ...p, items: p.items.map(MarketplaceAssembler.toProduct) }
  },

  toStoreForm(s: Store): StoreForm {
    return { name: s.name, description: s.description, ruc: s.ruc, photoUrl: s.photoUrl ?? '' }
  },

  toProductForm(p: Product): ProductForm {
    return {
      name: p.name,
      category: p.category,
      price: p.price,
      unit: p.unit,
      stock: p.stock,
      photoUrl: p.photoUrl ?? '',
    }
  },

  toCreateStore(f: StoreForm): CreateStoreResource {
    return {
      name: f.name.trim(),
      description: f.description.trim(),
      ruc: f.ruc.trim(),
      photoUrl: nullIfEmpty(f.photoUrl),
    }
  },

  toUpdateStore(f: StoreForm): UpdateStoreResource {
    return {
      name: f.name.trim(),
      description: f.description.trim(),
      photoUrl: nullIfEmpty(f.photoUrl),
    }
  },

  toProductRequest(f: ProductForm): ProductRequestResource {
    return {
      name: f.name.trim(),
      category: f.category.trim(),
      price: f.price ?? 0,
      unit: f.unit.trim(),
      stock: f.stock ?? 0,
      photoUrl: nullIfEmpty(f.photoUrl),
    }
  },
}
