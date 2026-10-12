<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isCancel } from 'axios'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import SelectButton from 'primevue/selectbutton'
import Select from 'primevue/select'
import Paginator, { type PageState } from 'primevue/paginator'
import Skeleton from 'primevue/skeleton'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import {
  PRODUCT_CATEGORIES,
  type Product,
  type Store,
} from '@/marketplace/domain/model/marketplace.entity'
import { productsApi, storesApi } from '@/marketplace/infrastructure/marketplace.api'
import { MarketplaceAssembler } from '@/marketplace/infrastructure/marketplace.assembler'
import StoreCard from '@/marketplace/presentation/components/StoreCard.vue'
import ProductCard from '@/marketplace/presentation/components/ProductCard.vue'

const PAGE_SIZE = 12
type Tab = 'stores' | 'products'

const route = useRoute()
const router = useRouter()
const notify = useNotify()

// La URL es la fuente de verdad: ?tab=products&q=palta&category=Frutas&page=2
const tab = computed<Tab>(() => (route.query.tab === 'products' ? 'products' : 'stores'))
const q = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))
const category = computed(() =>
  typeof route.query.category === 'string' ? route.query.category : '',
)
const page = computed(() => Math.max(1, Number(route.query.page) || 1))

const tabOptions = [
  { label: 'Tiendas', value: 'stores', icon: 'pi pi-shop' },
  { label: 'Productos', value: 'products', icon: 'pi pi-shopping-cart' },
]
const categoryOptions = [
  { label: 'Todas las categorías', value: null },
  ...PRODUCT_CATEGORIES.map((c) => ({ label: c, value: c })),
]

function setQuery(patch: Record<string, string | undefined>) {
  void router.replace({ query: { ...route.query, page: undefined, ...patch } })
}

const searchInput = ref(q.value)
let debounce: ReturnType<typeof setTimeout> | undefined
watch(searchInput, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => setQuery({ q: value.trim() || undefined }), 350)
})
watch(q, (value) => {
  if (value !== searchInput.value.trim()) searchInput.value = value
})
onBeforeUnmount(() => clearTimeout(debounce))

const stores = ref<Store[]>([])
const products = ref<Product[]>([])
const total = ref(0)
const loading = ref(false)
let controller: AbortController | null = null

watch(
  [tab, q, category, page],
  async ([t, search, cat, p]) => {
    controller?.abort()
    controller = new AbortController()
    loading.value = true
    try {
      if (t === 'stores') {
        const result = MarketplaceAssembler.toStorePage(
          await storesApi.list({ page: p, pageSize: PAGE_SIZE, search }, controller.signal),
        )
        stores.value = result.items
        total.value = result.totalItems
      } else {
        const result = MarketplaceAssembler.toProductPage(
          await productsApi.search(
            { page: p, pageSize: PAGE_SIZE, search, category: cat },
            controller.signal,
          ),
        )
        products.value = result.items
        total.value = result.totalItems
      }
      loading.value = false
    } catch (e) {
      if (isCancel(e)) return
      loading.value = false
      notify.error(e, 'No se pudo cargar el mercado')
    }
  },
  { immediate: true },
)

const items = computed(() => (tab.value === 'stores' ? stores.value : products.value))

function onPage(e: PageState) {
  void router.push({ query: { ...route.query, page: e.page > 0 ? String(e.page + 1) : undefined } })
}
</script>

<template>
  <section class="market container">
    <header class="market__header">
      <h1>Mercado saludable</h1>
      <p>Encuentra ingredientes frescos en tiendas de la comunidad.</p>
    </header>

    <div class="market__toolbar">
      <SelectButton
        :model-value="tab"
        :options="tabOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Ver tiendas o productos"
        @update:model-value="
          (v: Tab) =>
            setQuery({ tab: v === 'products' ? 'products' : undefined, category: undefined })
        "
      >
        <template #option="{ option }">
          <i :class="option.icon" aria-hidden="true" />
          <span>{{ option.label }}</span>
        </template>
      </SelectButton>

      <IconField class="market__search">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="searchInput"
          :placeholder="tab === 'stores' ? 'Buscar tienda…' : 'Buscar producto…'"
          aria-label="Buscar"
          fluid
        />
      </IconField>

      <Select
        v-if="tab === 'products'"
        :model-value="category || null"
        :options="categoryOptions"
        option-label="label"
        option-value="value"
        aria-label="Categoría"
        placeholder="Todas las categorías"
        class="market__category"
        @update:model-value="(v: string | null) => setQuery({ category: v || undefined })"
      />
    </div>

    <div v-if="loading && !items.length" class="market__grid">
      <Skeleton v-for="n in 8" :key="n" height="260px" border-radius="16px" />
    </div>

    <template v-else-if="items.length">
      <div class="market__grid" :class="{ 'market__grid--loading': loading }">
        <template v-if="tab === 'stores'">
          <StoreCard v-for="s in stores" :key="s.id" :store="s" />
        </template>
        <template v-else>
          <ProductCard v-for="p in products" :key="p.id" :product="p" show-store-link />
        </template>
      </div>
      <Paginator
        v-if="total > PAGE_SIZE"
        :first="(page - 1) * PAGE_SIZE"
        :rows="PAGE_SIZE"
        :total-records="total"
        class="market__paginator"
        @page="onPage"
      />
    </template>

    <EmptyState
      v-else
      :icon="tab === 'stores' ? 'pi pi-shop' : 'pi pi-shopping-cart'"
      :title="
        q || category
          ? 'Sin resultados'
          : tab === 'stores'
            ? 'Aún no hay tiendas'
            : 'Aún no hay productos'
      "
      :description="q || category ? 'Prueba con otra búsqueda o categoría.' : undefined"
    />
  </section>
</template>

<style scoped>
.market {
  padding-block: 2rem 3rem;
}

.market__header h1 {
  margin: 0;
  font-size: 2rem;
}

.market__header p {
  margin: 0.25rem 0 1.5rem;
  color: var(--p-text-muted-color);
}

.market__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.market__toolbar :deep(.p-togglebutton-content) {
  gap: 0.5rem;
}

.market__search {
  flex: 1;
  min-width: 220px;
  max-width: 420px;
}

.market__category {
  min-width: 220px;
}

.market__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.25rem;
  transition: opacity 0.15s;
}

.market__grid--loading {
  opacity: 0.6;
}

.market__paginator {
  margin-top: 2rem;
  background: transparent;
}
</style>
