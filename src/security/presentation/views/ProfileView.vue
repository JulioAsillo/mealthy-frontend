<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Avatar from 'primevue/avatar'
import Tag from 'primevue/tag'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { useAuthStore } from '@/security/application/auth.store'
import { ROLE_LABELS } from '@/security/domain/model/role'
import type { UpdateProfileForm } from '@/security/domain/model/auth-forms'
import { fromDateOnly } from '@/shared/domain/model/date-only'

const auth = useAuthStore()
const { user } = storeToRefs(auth)
const notify = useNotify()
const { submitting, submit, fieldError, generalError, reset } = useApiForm()

const editing = ref(false)
const form = reactive<UpdateProfileForm>({
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: null,
})

function loadForm() {
  if (!user.value) return
  form.firstName = user.value.firstName
  form.lastName = user.value.lastName
  form.phone = user.value.phone ?? ''
  form.birthDate = fromDateOnly(user.value.birthDate)
}

watch(user, loadForm, { immediate: true })

const memberSince = computed(() =>
  user.value
    ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(user.value.createdAt)
    : '',
)

const birthDateLabel = computed(() => {
  const date = fromDateOnly(user.value?.birthDate ?? null)
  return date ? new Intl.DateTimeFormat('es-PE', { dateStyle: 'long' }).format(date) : '—'
})

function startEditing() {
  loadForm()
  reset()
  editing.value = true
}

function cancel() {
  loadForm()
  reset()
  editing.value = false
}

async function onSubmit() {
  const ok = await submit(() => auth.updateProfile(form))
  if (ok) {
    editing.value = false
    notify.success('Perfil actualizado')
  }
}
</script>

<template>
  <section v-if="user" class="profile container">
    <header class="profile__header">
      <Avatar :label="user.initials" size="xlarge" shape="circle" class="profile__avatar" />
      <div>
        <h1>{{ user.fullName }}</h1>
        <p class="profile__username">@{{ user.username }}</p>
        <Tag :value="ROLE_LABELS[user.role]" severity="warn" />
      </div>
    </header>

    <div class="profile__card">
      <div class="profile__card-header">
        <h2>Datos personales</h2>
        <Button
          v-if="!editing"
          label="Editar"
          icon="pi pi-pencil"
          severity="secondary"
          outlined
          @click="startEditing"
        />
      </div>

      <dl v-if="!editing" class="profile__data">
        <div>
          <dt>Correo</dt>
          <dd>{{ user.email }}</dd>
        </div>
        <div>
          <dt>Teléfono</dt>
          <dd>{{ user.phone ?? '—' }}</dd>
        </div>
        <div>
          <dt>Fecha de nacimiento</dt>
          <dd>{{ birthDateLabel }}</dd>
        </div>
        <div>
          <dt>Miembro desde</dt>
          <dd>{{ memberSince }}</dd>
        </div>
      </dl>

      <form v-else class="profile__form" novalidate @submit.prevent="onSubmit">
        <Message v-if="generalError()" severity="error" :closable="false">
          {{ generalError() }}
        </Message>

        <div class="profile__row">
          <FormField label="Nombres" for="firstName" :error="fieldError('firstName')">
            <InputText id="firstName" v-model="form.firstName" maxlength="80" />
          </FormField>
          <FormField label="Apellidos" for="lastName" :error="fieldError('lastName')">
            <InputText id="lastName" v-model="form.lastName" maxlength="80" />
          </FormField>
        </div>

        <div class="profile__row">
          <FormField label="Teléfono" for="phone" optional :error="fieldError('phone')">
            <InputText id="phone" v-model="form.phone" type="tel" maxlength="20" />
          </FormField>
          <FormField
            label="Fecha de nacimiento"
            for="birthDate"
            optional
            :error="fieldError('birthDate')"
          >
            <DatePicker
              v-model="form.birthDate"
              input-id="birthDate"
              date-format="dd/mm/yy"
              :max-date="new Date()"
              show-icon
              show-button-bar
            />
          </FormField>
        </div>

        <div class="profile__actions">
          <Button type="button" label="Cancelar" severity="secondary" text @click="cancel" />
          <Button
            type="submit"
            label="Guardar cambios"
            icon="pi pi-check"
            :loading="submitting"
            :disabled="!form.firstName.trim() || !form.lastName.trim()"
          />
        </div>
      </form>
    </div>
  </section>
</template>

<style scoped>
.profile {
  padding-block: 2.5rem;
  max-width: 820px;
}

.profile__header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.profile__header h1 {
  margin: 0;
  font-size: 1.75rem;
}

.profile__username {
  margin: 0.125rem 0 0.5rem;
  color: var(--p-text-muted-color);
}

.profile__avatar {
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  flex-shrink: 0;
}

.profile__card {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  padding: 1.5rem;
}

.profile__card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.profile__card-header h2 {
  margin: 0;
  font-size: 1.125rem;
}

.profile__data {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin: 0;
}

.profile__data dt {
  font-size: 0.8rem;
  color: var(--p-text-muted-color);
  margin-bottom: 0.25rem;
}

.profile__data dd {
  margin: 0;
  font-weight: 500;
  word-break: break-word;
}

.profile__form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.profile__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.profile__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 560px) {
  .profile__row {
    grid-template-columns: 1fr;
  }

  .profile__header {
    flex-direction: column;
    text-align: center;
  }
}
</style>
