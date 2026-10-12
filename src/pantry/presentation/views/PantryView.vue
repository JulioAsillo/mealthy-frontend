<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfirm } from 'primevue/useconfirm'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import SelectButton from 'primevue/selectbutton'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { usePantryStore } from '@/pantry/application/pantry.store'
import { expirationStatus, type Supply } from '@/pantry/domain/model/supply.entity'
import { normalizeName } from '@/pantry/domain/model/ingredient-match'
import ExpirationTag from '@/pantry/presentation/components/ExpirationTag.vue'
import SupplyFormDialog from '@/pantry/presentation/components/SupplyFormDialog.vue'

const store = usePantryStore()
const { supplies, loading, stats } = storeToRefs(store)
const notify = useNotify()
const confirm = useConfirm()

onMounted(async () => {
  try {
    await store.load({ force: true })
  } catch (e) {
    notify.error(e, 'No se pudo cargar tu despensa')
  }
})

type Filter = 'all' | 'soon' | 'expired'
const filter = ref<Filter>('all')
const search = ref('')

const filterOptions = computed(() => [
  { label: `Todos (${stats.value.total})`, value: 'all' },
  { label: `Por vencer (${stats.value.soon})`, value: 'soon' },
  { label: `Vencidos (${stats.value.expired})`, value: 'expired' },
])

const rows = computed(() => {
  const term = normalizeName(search.value)
  return supplies.value
    .filter((s) => filter.value === 'all' || expirationStatus(s) === filter.value)
    .filter((s) => !term || normalizeName(s.name).includes(term))
})

const quantityFormat = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })
const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })

// Diálogo crear / editar
const dialogVisible = ref(false)
const editing = ref<Supply | null>(null)

function openCreate() {
  editing.value = null
  dialogVisible.value = true
}

function openEdit(supply: Supply) {
  editing.value = supply
  dialogVisible.value = true
}

function onSaved(supply: Supply) {
  notify.success(editing.value ? 'Insumo actualizado' : `${supply.name} agregado a tu despensa`)
}

function confirmDelete(supply: Supply) {
  confirm.require({
    header: 'Quitar de la despensa',
    message: `¿Quitar “${supply.name}”?`,
    icon: 'pi pi-trash',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Quitar', severity: 'danger' },
    accept: async () => {
      try {
        await store.remove(supply.id)
        notify.success('Insumo eliminado')
      } catch (e) {
        notify.error(e, 'No se pudo eliminar')
      }
    },
  })
}

</script>

<template>
  <section class="pantry container">
    <header class="pantry__header">
      <div>
        <h1>Mi despensa</h1>
        <p>Controla lo que tienes en casa y evita que algo se venza.</p>
      </div>
      <Button label="Agregar insumo" icon="pi pi-plus" @click="openCreate" />
    </header>

    <div class="pantry__stats">
      <div class="stat">
        <i class="pi pi-box" aria-hidden="true" />
        <div>
          <strong>{{ stats.total }}</strong>
          <span>insumos</span>
        </div>
      </div>
      <div class="stat stat--warn">
        <i class="pi pi-exclamation-triangle" aria-hidden="true" />
        <div>
          <strong>{{ stats.soon }}</strong>
          <span>por vencer</span>
        </div>
      </div>
      <div class="stat stat--danger">
        <i class="pi pi-times-circle" aria-hidden="true" />
        <div>
          <strong>{{ stats.expired }}</strong>
          <span>vencidos</span>
        </div>
      </div>
    </div>

    <div class="pantry__toolbar">
      <IconField class="pantry__search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Buscar insumo…" aria-label="Buscar insumo" fluid />
      </IconField>
      <SelectButton
        v-model="filter"
        :options="filterOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Filtrar por vencimiento"
      />
    </div>

    <div class="pantry__table">
      <DataTable
        :value="rows"
        :loading="loading && !supplies.length"
        data-key="id"
        sort-field="expiresOn"
        :sort-order="1"
        :null-sort-order="1"
        :paginator="rows.length > 15"
        :rows="15"
        scrollable
        striped-rows
      >
        <template #empty>
          <EmptyState
            v-if="!loading"
            icon="pi pi-shopping-bag"
            :title="supplies.length ? 'Nada coincide con el filtro' : 'Tu despensa está vacía'"
            :description="
              supplies.length
                ? 'Prueba con otra búsqueda o filtro.'
                : 'Agrega lo que tienes en casa y te avisaremos cuando algo esté por vencer.'
            "
          />
        </template>

        <Column field="name" header="Insumo" sortable>
          <template #body="{ data }">
            <strong>{{ data.name }}</strong>
          </template>
        </Column>
        <Column field="quantity" header="Cantidad" sortable>
          <template #body="{ data }">
            {{ quantityFormat.format(data.quantity) }} {{ data.unit }}
          </template>
        </Column>
        <Column field="expiresOn" header="Vencimiento" sortable>
          <template #body="{ data }">
            <div class="pantry__expires">
              <ExpirationTag :supply="data" />
              <small v-if="data.expiresOn">{{ dateFormat.format(data.expiresOn) }}</small>
            </div>
          </template>
        </Column>
        <Column header="" class="pantry__actions-col">
          <template #body="{ data }">
            <div class="pantry__actions">
              <Button
                icon="pi pi-pencil"
                severity="secondary"
                text
                rounded
                :aria-label="`Editar ${data.name}`"
                @click="openEdit(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                :aria-label="`Quitar ${data.name}`"
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <SupplyFormDialog v-model:visible="dialogVisible" :supply="editing" @saved="onSaved" />
  </section>
</template>

<style scoped>
.pantry {
  padding-block: 2rem 3rem;
}

.pantry__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.pantry__header h1 {
  margin: 0;
  font-size: 2rem;
}

.pantry__header p {
  margin: 0.25rem 0 0;
  color: var(--p-text-muted-color);
}

.pantry__stats {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
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
  font-size: 1.5rem;
  line-height: 1.1;
}

.stat span {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
}

.stat--warn i {
  color: var(--p-amber-500);
}

.stat--danger i {
  color: var(--p-red-500);
}

.pantry__toolbar {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.pantry__search {
  flex: 1;
  min-width: 220px;
  max-width: 380px;
}

.pantry__table {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
}

.pantry__expires {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.pantry__expires small {
  color: var(--p-text-muted-color);
}

.pantry__actions {
  display: flex;
  justify-content: flex-end;
}

:deep(.pantry__actions-col) {
  width: 110px;
}

@media (max-width: 640px) {
  .pantry__stats {
    grid-template-columns: 1fr;
  }
}
</style>
