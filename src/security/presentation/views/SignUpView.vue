<script setup lang="ts">
import { computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AuthCard from '@/security/presentation/components/AuthCard.vue'
import RoleSelector from '@/security/presentation/components/RoleSelector.vue'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { useAuthStore } from '@/security/application/auth.store'
import { homeRouteFor } from '@/security/application/home-route'
import { Role } from '@/security/domain/model/role'
import type { SignUpForm } from '@/security/domain/model/auth-forms'

const auth = useAuthStore()
const router = useRouter()
const notify = useNotify()
const { submitting, submit, fieldError, generalError } = useApiForm()

const form = reactive<SignUpForm>({
  role: Role.Customer,
  username: '',
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  phone: '',
  birthDate: null,
})

const maxBirthDate = new Date()

// Reglas espejo de SignUpRequest (el backend valida igual; esto solo evita viajes inútiles).
const canSubmit = computed(
  () =>
    form.username.trim().length >= 3 &&
    form.email.includes('@') &&
    form.password.length >= 8 &&
    form.firstName.trim() !== '' &&
    form.lastName.trim() !== '',
)

async function onSubmit() {
  const ok = await submit(() => auth.signUp(form))
  if (ok) {
    notify.success('¡Cuenta creada!', `Bienvenido, ${auth.user?.firstName}`)
    await router.replace(homeRouteFor(auth.role))
  }
}
</script>

<template>
  <AuthCard title="Crear cuenta" subtitle="Únete a la comunidad de Mealthy">
    <form class="auth-form" novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false">
        {{ generalError() }}
      </Message>

      <FormField label="Tipo de cuenta" for="role" :error="fieldError('role')">
        <RoleSelector id="role" v-model="form.role" />
      </FormField>

      <div class="auth-form__row">
        <FormField label="Nombres" for="firstName" :error="fieldError('firstName')">
          <InputText
            id="firstName"
            v-model="form.firstName"
            autocomplete="given-name"
            maxlength="80"
            :invalid="!!fieldError('firstName')"
          />
        </FormField>
        <FormField label="Apellidos" for="lastName" :error="fieldError('lastName')">
          <InputText
            id="lastName"
            v-model="form.lastName"
            autocomplete="family-name"
            maxlength="80"
            :invalid="!!fieldError('lastName')"
          />
        </FormField>
      </div>

      <FormField
        label="Usuario"
        for="username"
        :error="fieldError('username')"
        hint="3-30 caracteres: letras, números, punto o guion bajo"
      >
        <InputText
          id="username"
          v-model="form.username"
          autocomplete="username"
          maxlength="30"
          :invalid="!!fieldError('username')"
        />
      </FormField>

      <FormField label="Correo electrónico" for="email" :error="fieldError('email')">
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          maxlength="254"
          :invalid="!!fieldError('email')"
        />
      </FormField>

      <FormField
        label="Contraseña"
        for="password"
        :error="fieldError('password')"
        hint="Mínimo 8 caracteres"
      >
        <Password
          v-model="form.password"
          input-id="password"
          toggle-mask
          autocomplete="new-password"
          :maxlength="72"
          prompt-label="Elige una contraseña"
          weak-label="Débil"
          medium-label="Media"
          strong-label="Fuerte"
          :invalid="!!fieldError('password')"
        />
      </FormField>

      <div class="auth-form__row">
        <FormField label="Teléfono" for="phone" optional :error="fieldError('phone')">
          <InputText
            id="phone"
            v-model="form.phone"
            type="tel"
            autocomplete="tel"
            maxlength="20"
            :invalid="!!fieldError('phone')"
          />
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
            :max-date="maxBirthDate"
            show-icon
            :invalid="!!fieldError('birthDate')"
          />
        </FormField>
      </div>

      <Button
        type="submit"
        label="Crear cuenta"
        icon="pi pi-user-plus"
        :loading="submitting"
        :disabled="!canSubmit"
        fluid
      />
    </form>

    <template #footer>
      ¿Ya tienes cuenta?
      <RouterLink :to="{ name: 'sign-in' }">Inicia sesión</RouterLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.auth-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .auth-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
