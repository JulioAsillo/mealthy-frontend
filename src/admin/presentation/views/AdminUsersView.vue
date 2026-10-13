<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useConfirm } from 'primevue/useconfirm'
import DataTable, { type DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Avatar from 'primevue/avatar'
import Dialog from 'primevue/dialog'
import SelectButton from 'primevue/selectbutton'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { fromDateOnly } from '@/shared/domain/model/date-only'
import { useAuthStore } from '@/security/application/auth.store'
import { ROLE_LABELS, type Role } from '@/security/domain/model/role'
import type { User } from '@/security/domain/model/user.entity'
import { useAdminStore } from '@/admin/application/admin.store'
import RoleTag from '@/admin/presentation/components/RoleTag.vue'

const PAGE_SIZE = 20

const auth = useAuthStore()
const admin = useAdminStore()
const { users, totalUsers, loadingUsers } = storeToRefs(admin)
const notify = useNotify()
const confirm = useConfirm()

const page = ref(1)

async function load() {
  try {
    await admin.loadUsers(page.value, PAGE_SIZE)
  } catch (e) {
    notify.error(e, 'No se pudieron cargar los usuarios')
  }
}

onMounted(load)

function onPage(e: DataTablePageEvent) {
  page.value = e.page + 1
  void load()
}

/** El backend no filtra por rol: el filtro aplica sobre la página cargada. */
type RoleFilter = Role | 'all'
const roleFilter = ref<RoleFilter>('all')
const roleOptions = [
  { label: 'Todos', value: 'all' },
  ...(['Customer', 'StoreOwner', 'Admin'] as Role[]).map((r) => ({
    label: ROLE_LABELS[r],
    value: r,
  })),
]
const rows = computed(() =>
  roleFilter.value === 'all' ? users.value : users.value.filter((u) => u.role === roleFilter.value),
)

const dateFormat = new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' })

// Detalle
const detail = ref<User | null>(null)
const detailOpen = ref(false)
async function openDetail(user: User) {
  detail.value = user
  detailOpen.value = true
  try {
    detail.value = await admin.getUser(user.id)
  } catch (e) {
    notify.error(e, 'No se pudo cargar el detalle')
  }
}

/** Nadie se borra a sí mismo ni borra a otro Admin desde la UI. */
function canDelete(user: User): boolean {
  return user.id !== auth.user?.id && user.role !== 'Admin'
}

function confirmDelete(user: User) {
  confirm.require({
    header: 'Eliminar usuario',
    message: `¿Eliminar a ${user.fullName} (${user.email})? Esta acción no se puede deshacer.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Eliminar', severity: 'danger' },
    accept: async () => {
      try {
        await admin.deleteUser(user.id)
        detailOpen.value = false
        notify.success('Usuario eliminado')
        if (!users.value.length && page.value > 1) {
          page.value--
          await load()
        }
      } catch (e) {
        notify.error(e, 'No se pudo eliminar el usuario')
      }
    },
  })
}
</script>

<template>
  <section class="users container">
    <header class="users__header">
      <div>
        <RouterLink :to="{ name: 'admin-dashboard' }" class="users__back">
          <i class="pi pi-arrow-left" aria-hidden="true" /> Panel
        </RouterLink>
        <h1>Usuarios</h1>
        <p>{{ totalUsers }} cuentas registradas</p>
      </div>
      <SelectButton
        v-model="roleFilter"
        :options="roleOptions"
        option-label="label"
        option-value="value"
        :allow-empty="false"
        aria-label="Filtrar por rol"
      />
    </header>

    <div class="users__table">
      <DataTable
        :value="rows"
        lazy
        paginator
        :rows="PAGE_SIZE"
        :total-records="totalUsers"
        :first="(page - 1) * PAGE_SIZE"
        :loading="loadingUsers"
        data-key="id"
        striped-rows
        scrollable
        @page="onPage"
      >
        <template #empty>
          <EmptyState icon="pi pi-users" title="Sin usuarios en esta vista" />
        </template>
        <Column header="Usuario">
          <template #body="{ data }">
            <div class="users__cell">
              <Avatar :label="data.initials" shape="circle" class="users__avatar" />
              <div>
                <strong>{{ data.fullName }}</strong>
                <small>@{{ data.username }}</small>
              </div>
            </div>
          </template>
        </Column>
        <Column field="email" header="Email" />
        <Column header="Rol">
          <template #body="{ data }"><RoleTag :role="data.role" /></template>
        </Column>
        <Column header="Registro">
          <template #body="{ data }">{{ dateFormat.format(data.createdAt) }}</template>
        </Column>
        <Column header="" class="users__actions-col">
          <template #body="{ data }">
            <div class="users__actions">
              <Button
                icon="pi pi-eye"
                severity="secondary"
                text
                rounded
                :aria-label="`Ver ${data.fullName}`"
                @click="openDetail(data)"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                :aria-label="`Eliminar ${data.fullName}`"
                :disabled="!canDelete(data)"
                v-tooltip.left="
                  canDelete(data) ? undefined : 'No se puede eliminar a un administrador'
                "
                @click="confirmDelete(data)"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="detailOpen"
      modal
      header="Detalle del usuario"
      :style="{ width: 'min(460px, calc(100vw - 2rem))' }"
      :draggable="false"
    >
      <div v-if="detail" class="detail">
        <div class="detail__head">
          <Avatar :label="detail.initials" size="xlarge" shape="circle" class="users__avatar" />
          <div>
            <h3>{{ detail.fullName }}</h3>
            <span>@{{ detail.username }}</span>
          </div>
        </div>
        <dl>
          <dt>Email</dt>
          <dd>{{ detail.email }}</dd>
          <dt>Rol</dt>
          <dd><RoleTag :role="detail.role" /></dd>
          <dt>Teléfono</dt>
          <dd>{{ detail.phone ?? '—' }}</dd>
          <dt>Nacimiento</dt>
          <dd>{{ detail.birthDate ? dateFormat.format(fromDateOnly(detail.birthDate)!) : '—' }}</dd>
          <dt>Registro</dt>
          <dd>{{ dateFormat.format(detail.createdAt) }}</dd>
        </dl>
      </div>
      <template #footer>
        <Button
          v-if="detail && canDelete(detail)"
          label="Eliminar"
          icon="pi pi-trash"
          severity="danger"
          text
          @click="confirmDelete(detail)"
        />
        <Button label="Cerrar" severity="secondary" @click="detailOpen = false" />
      </template>
    </Dialog>
  </section>
</template>

<style scoped>
.users {
  padding-block: 2rem 3rem;
}

.users__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.users__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  font-size: 0.9rem;
}

.users__header h1 {
  margin: 0.25rem 0 0;
  font-size: 2rem;
}

.users__header p {
  margin: 0.25rem 0 0;
  color: var(--p-text-muted-color);
}

.users__table {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
}

.users__cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.users__cell small {
  display: block;
  color: var(--p-text-muted-color);
}

.users__avatar {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  flex-shrink: 0;
}

.users__actions {
  display: flex;
  justify-content: flex-end;
}

:deep(.users__actions-col) {
  width: 110px;
}

.detail__head {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.detail__head h3 {
  margin: 0;
}

.detail__head span {
  color: var(--p-text-muted-color);
}

.detail dl {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 0.6rem 1rem;
  margin: 0;
}

.detail dt {
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
}

.detail dd {
  margin: 0;
  word-break: break-word;
}
</style>
