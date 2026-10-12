<script setup lang="ts">
import { reactive } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import AuthCard from '@/security/presentation/components/AuthCard.vue'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useAuthStore } from '@/security/application/auth.store'
import { homeRouteFor } from '@/security/application/home-route'
import type { SignInForm } from '@/security/domain/model/auth-forms'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const { submitting, submit, fieldError, generalError } = useApiForm()

const form = reactive<SignInForm>({ email: '', password: '' })

/** Solo se permiten redirecciones internas (evita open redirect). */
function safeRedirect(): string | null {
  const redirect = route.query.redirect
  return typeof redirect === 'string' && redirect.startsWith('/') && !redirect.startsWith('//')
    ? redirect
    : null
}

async function onSubmit() {
  const ok = await submit(() => auth.signIn(form))
  if (ok) await router.replace(safeRedirect() ?? homeRouteFor(auth.role))
}
</script>

<template>
  <AuthCard title="Iniciar sesión" subtitle="Bienvenido de vuelta a Mealthy">
    <form class="auth-form" novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false">
        {{ generalError() }}
      </Message>

      <FormField label="Correo electrónico" for="email" :error="fieldError('email')">
        <InputText
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          :invalid="!!fieldError('email')"
        />
      </FormField>

      <FormField label="Contraseña" for="password" :error="fieldError('password')">
        <Password
          v-model="form.password"
          input-id="password"
          :feedback="false"
          toggle-mask
          autocomplete="current-password"
          required
          :invalid="!!fieldError('password')"
        />
      </FormField>

      <Button
        type="submit"
        label="Ingresar"
        icon="pi pi-sign-in"
        :loading="submitting"
        :disabled="!form.email || !form.password"
        fluid
      />
    </form>

    <template #footer>
      ¿No tienes cuenta?
      <RouterLink :to="{ name: 'sign-up' }">Regístrate</RouterLink>
    </template>
  </AuthCard>
</template>

<style scoped>
.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}
</style>
