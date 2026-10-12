<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Skeleton from 'primevue/skeleton'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import SmartImage from '@/shared/presentation/components/SmartImage.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { ApiError } from '@/shared/domain/model/api-error'
import { normalizeName } from '@/pantry/domain/model/ingredient-match'
import type { Product, Store } from '@/marketplace/domain/model/marketplace.entity'
import { productsApi, storesApi } from '@/marketplace/infrastructure/marketplace.api'
import { MarketplaceAssembler } from '@/marketplace/infrastructure/marketplace.assembler'
import ProductCard from '@/marketplace/presentation/components/ProductCard.vue'

const props = defineProps<{ id: number }>()
const notify = useNotify()

const store = ref<Store | null>(null)
const products = ref<Product[]>([])
const notFound = ref(false)
const search = ref('')
const category = ref<string | null>(null)

watch(
  () => props.id,
  async (id) => {
    store.value = null
    notFound.value = false
    try {
      const [s, page] = await Promise.all([
        storesApi.getById(id),
        productsApi.listByStore(id, { page: 1, pageSize: 100 }),
      ])
      store.value = MarketplaceAssembler.toStore(s)
      products.value = page.items.map(MarketplaceAssembler.toProduct)
    } catch (e) {
      if (e instanceof ApiError && e.isNotFound) notFound.value = true
      else notify.error(e, 'No se pudo cargar la tienda')
    }
  },
  { immediate: true },
)

/** Categorías presentes en esta tienda, para filtrar con chips. */
const categories = computed(() => [...new Set(products.value.map((p) => p.category))].sort())

const filtered = computed(() => {
  const term = normalizeName(search.value)
  return products.value
    .filter((p) => !category.value || p.category === category.value)
    .filter((p) => !term || normalizeName(p.name).includes(term))
    .sort((a, b) => Number(b.stock > 0) - Number(a.stock > 0))
})
</script>

<template>
  <section class="store container">
    <RouterLink :to="{ name: 'market' }" class="store__back">
      <i class="pi pi-arrow-left" aria-hidden="true" /> Mercado
    </RouterLink>

    <EmptyState v-if="notFound" icon="pi pi-shop" title="Tienda no encontrada" />

    <div v-else-if="!store" class="store__loading">
      <Skeleton height="180px" border-radius="16px" />
      <Skeleton width="40%" height="2rem" />
    </div>

    <template v-else>
      <header class="store__hero">
        <div class="store__logo">
          <SmartImage :src="store.photoUrl" :alt="store.name" icon="pi pi-shop" />
        </div>
        <div>
          <h1>{{ store.name }}</h1>
          <p>{{ store.description }}</p>
          <small>RUC {{ store.ruc }} · {{ products.length }} productos</small>
        </div>
      </header>

      <div class="store__toolbar">
        <IconField class="store__search">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Buscar en esta tienda…"
            aria-label="Buscar producto"
            fluid
          />
        </IconField>
        <div v-if="categories.length > 1" class="store__chips" role="group" aria-label="Categorías">
          <button
            type="button"
            class="chip"
            :class="{ 'chip--active': category === null }"
            @click="category = null"
          >
            Todas
          </button>
          <button
            v-for="c in categories"
            :key="c"
            type="button"
            class="chip"
            :class="{ 'chip--active': category === c }"
            @click="category = c"
          >
            {{ c }}
          </button>
        </div>
      </div>

      <div v-if="filtered.length" class="store__grid">
        <ProductCard v-for="p in filtered" :key="p.id" :product="p" />
      </div>
      <EmptyState
        v-else
        icon="pi pi-shopping-cart"
        :title="products.length ? 'Nada coincide' : 'Esta tienda aún no tiene productos'"
      />
    </template>
  </section>
</template>

<style scoped>
.store {
  padding-block: 1.5rem 3rem;
}

.store__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  margin-bottom: 1rem;
}

.store__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.store__hero {
  display: flex;
  gap: 1.5rem;
  align-items: center;
  padding: 1.5rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  margin-bottom: 1.5rem;
}

.store__logo {
  width: 120px;
  height: 120px;
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
  flex-shrink: 0;
}

.store__hero h1 {
  margin: 0 0 0.25rem;
}

.store__hero p {
  margin: 0 0 0.5rem;
  color: var(--p-text-muted-color);
}

.store__hero small {
  color: var(--p-text-muted-color);
}

.store__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.25rem;
}

.store__search {
  min-width: 220px;
  max-width: 360px;
  flex: 1;
}

.store__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  border: 1px solid var(--p-content-border-color);
  background: var(--p-content-background);
  color: var(--p-text-color);
  border-radius: 999px;
  padding: 0.35rem 0.875rem;
  font: inherit;
  font-size: 0.85rem;
  cursor: pointer;
}

.chip--active {
  background: var(--p-primary-color);
  border-color: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
}

.chip:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.store__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
}

@media (max-width: 560px) {
  .store__hero {
    flex-direction: column;
    text-align: center;
  }
}
</style>
