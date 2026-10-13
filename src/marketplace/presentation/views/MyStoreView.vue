<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Skeleton from 'primevue/skeleton'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import MediaImage from '@/media/presentation/components/MediaImage.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { normalizeName } from '@/pantry/domain/model/ingredient-match'
import { useMyStoreStore } from '@/marketplace/application/my-store.store'
import { formatPrice, type Product } from '@/marketplace/domain/model/marketplace.entity'
import StockTag from '@/marketplace/presentation/components/StockTag.vue'
import StoreFormDialog from '@/marketplace/presentation/components/StoreFormDialog.vue'
import ProductFormDialog from '@/marketplace/presentation/components/ProductFormDialog.vue'

const myStore = useMyStoreStore()
const { store, products, hasStore, loading, stats } = storeToRefs(myStore)
const notify = useNotify()
const confirm = useConfirm()

onMounted(async () => {
  try {
    await myStore.load()
  } catch (e) {
    notify.error(e, 'No se pudo cargar tu tienda')
  }
})

const storeDialog = ref(false)
const productDialog = ref(false)
const editingProduct = ref<Product | null>(null)
const search = ref('')

const rows = computed(() => {
  const term = normalizeName(search.value)
  return term ? products.value.filter((p) => normalizeName(p.name).includes(term)) : products.value
})

function openProduct(product: Product | null) {
  editingProduct.value = product
  productDialog.value = true
}

function onProductSaved(p: Product) {
  notify.success(editingProduct.value ? 'Producto actualizado' : `${p.name} publicado`)
}

function confirmDelete(p: Product) {
  confirm.require({
    header: 'Eliminar producto',
    message: `¿Eliminar “${p.name}” de tu tienda?`,
    icon: 'pi pi-trash',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Eliminar', severity: 'danger' },
    accept: async () => {
      try {
        await myStore.removeProduct(p.id)
        notify.success('Producto eliminado')
      } catch (e) {
        notify.error(e, 'No se pudo eliminar')
      }
    },
  })
}
</script>

<template>
  <section class="my-store container">
    <div v-if="hasStore === null && loading" class="my-store__loading">
      <Skeleton height="140px" border-radius="16px" />
      <Skeleton height="300px" border-radius="16px" />
    </div>

    <!-- Onboarding: el dueño aún no registró su tienda -->
    <div v-else-if="hasStore === false" class="my-store__onboarding">
      <EmptyState
        icon="pi pi-shop"
        title="Registra tu tienda"
        description="Necesitas una tienda para publicar productos en el mercado de Mealthy. Solo te tomará un minuto."
      >
        <Button label="Registrar mi tienda" icon="pi pi-plus" @click="storeDialog = true" />
      </EmptyState>
    </div>

    <template v-else-if="store">
      <header class="my-store__hero">
        <div class="my-store__logo">
          <MediaImage :image-id="store.imageId" variant="sm" :alt="store.name" icon="pi pi-shop" />
        </div>
        <div class="my-store__info">
          <h1>{{ store.name }}</h1>
          <p>{{ store.description }}</p>
          <small>RUC {{ store.ruc }}</small>
        </div>
        <div class="my-store__hero-actions">
          <RouterLink
            :to="{ name: 'store-detail', params: { id: store.id } }"
            custom
            v-slot="{ navigate }"
          >
            <Button
              label="Ver como cliente"
              icon="pi pi-eye"
              severity="secondary"
              text
              @click="navigate"
            />
          </RouterLink>
          <Button
            label="Editar tienda"
            icon="pi pi-pencil"
            severity="secondary"
            outlined
            @click="storeDialog = true"
          />
        </div>
      </header>

      <div class="my-store__stats">
        <div class="stat">
          <i class="pi pi-box" aria-hidden="true" />
          <div>
            <strong>{{ stats.total }}</strong
            ><span>productos</span>
          </div>
        </div>
        <div class="stat stat--danger">
          <i class="pi pi-ban" aria-hidden="true" />
          <div>
            <strong>{{ stats.outOfStock }}</strong
            ><span>agotados</span>
          </div>
        </div>
        <div class="stat">
          <i class="pi pi-wallet" aria-hidden="true" />
          <div>
            <strong>{{ formatPrice(stats.inventoryValue) }}</strong
            ><span>valor de inventario</span>
          </div>
        </div>
      </div>

      <div class="my-store__toolbar">
        <IconField class="my-store__search">
          <InputIcon class="pi pi-search" />
          <InputText
            v-model="search"
            placeholder="Buscar producto…"
            aria-label="Buscar producto"
            fluid
          />
        </IconField>
        <Button label="Nuevo producto" icon="pi pi-plus" @click="openProduct(null)" />
      </div>

      <div class="my-store__table">
        <DataTable
          :value="rows"
          data-key="id"
          :paginator="rows.length > 15"
          :rows="15"
          striped-rows
          scrollable
        >
          <template #empty>
            <EmptyState
              icon="pi pi-shopping-cart"
              :title="products.length ? 'Nada coincide' : 'Aún no tienes productos'"
              :description="
                products.length
                  ? undefined
                  : 'Publica tu primer producto para que los clientes lo encuentren.'
              "
            />
          </template>
          <Column header="" class="my-store__thumb-col">
            <template #body="{ data }">
              <div class="my-store__thumb">
                <MediaImage
                  :image-id="data.imageId"
                  variant="sm"
                  :alt="data.name"
                  icon="pi pi-shopping-cart"
                />
              </div>
            </template>
          </Column>
          <Column field="name" header="Producto" sortable>
            <template #body="{ data }">
              <strong>{{ data.name }}</strong>
              <div class="my-store__category">{{ data.category }}</div>
            </template>
          </Column>
          <Column field="price" header="Precio" sortable>
            <template #body="{ data }">{{ formatPrice(data.price) }} / {{ data.unit }}</template>
          </Column>
          <Column field="stock" header="Stock" sortable>
            <template #body="{ data }"><StockTag :product="data" /></template>
          </Column>
          <Column header="" class="my-store__actions-col">
            <template #body="{ data }">
              <div class="my-store__actions">
                <Button
                  icon="pi pi-pencil"
                  severity="secondary"
                  text
                  rounded
                  :aria-label="`Editar ${data.name}`"
                  @click="openProduct(data)"
                />
                <Button
                  icon="pi pi-trash"
                  severity="danger"
                  text
                  rounded
                  :aria-label="`Eliminar ${data.name}`"
                  @click="confirmDelete(data)"
                />
              </div>
            </template>
          </Column>
        </DataTable>
      </div>
    </template>

    <StoreFormDialog
      v-model:visible="storeDialog"
      :store="store"
      @saved="notify.success(hasStore ? 'Tienda guardada' : 'Tienda registrada')"
    />
    <ProductFormDialog
      v-model:visible="productDialog"
      :product="editingProduct"
      @saved="onProductSaved"
    />
  </section>
</template>

<style scoped>
.my-store {
  padding-block: 2rem 3rem;
}

.my-store__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.my-store__onboarding {
  max-width: 560px;
  margin: 2rem auto;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
}

.my-store__hero {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  flex-wrap: wrap;
  padding: 1.5rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  margin-bottom: 1.25rem;
}

.my-store__logo {
  width: 96px;
  height: 96px;
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
  flex-shrink: 0;
}

.my-store__info {
  flex: 1;
  min-width: 200px;
}

.my-store__info h1 {
  margin: 0 0 0.25rem;
  font-size: 1.6rem;
}

.my-store__info p {
  margin: 0 0 0.25rem;
  color: var(--p-text-muted-color);
}

.my-store__info small {
  color: var(--p-text-muted-color);
}

.my-store__hero-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.my-store__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.stat {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
}

.stat i {
  font-size: 1.4rem;
  color: var(--p-primary-color);
}

.stat strong {
  display: block;
  font-size: 1.35rem;
  line-height: 1.15;
}

.stat span {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

.stat--danger i {
  color: var(--p-red-500);
}

.my-store__toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.my-store__search {
  flex: 1;
  min-width: 220px;
  max-width: 380px;
}

.my-store__table {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
}

.my-store__thumb {
  width: 48px;
  height: 48px;
  border-radius: var(--p-border-radius-md);
  overflow: hidden;
}

.my-store__category {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
}

.my-store__actions {
  display: flex;
  justify-content: flex-end;
}

:deep(.my-store__thumb-col) {
  width: 72px;
}

:deep(.my-store__actions-col) {
  width: 110px;
}

@media (max-width: 640px) {
  .my-store__stats {
    grid-template-columns: 1fr;
  }
}
</style>
