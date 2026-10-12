<script setup lang="ts">
import { ROLE_LABELS, SIGN_UP_ROLES, type SignUpRole } from '@/security/domain/model/role'

const model = defineModel<SignUpRole>({ required: true })

const descriptions: Record<SignUpRole, { icon: string; text: string }> = {
  Customer: { icon: 'pi pi-heart', text: 'Descubre recetas y gestiona tu despensa' },
  StoreOwner: { icon: 'pi pi-shop', text: 'Vende tus productos a la comunidad' },
}
</script>

<template>
  <div class="role-selector" role="radiogroup" aria-label="Tipo de cuenta">
    <button
      v-for="role in SIGN_UP_ROLES"
      :key="role"
      type="button"
      role="radio"
      :aria-checked="model === role"
      class="role-selector__option"
      :class="{ 'role-selector__option--active': model === role }"
      @click="model = role"
    >
      <i :class="descriptions[role].icon" aria-hidden="true" />
      <strong>{{ ROLE_LABELS[role] }}</strong>
      <small>{{ descriptions[role].text }}</small>
    </button>
  </div>
</template>

<style scoped>
.role-selector {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.role-selector__option {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
  text-align: left;
  padding: 0.875rem;
  border: 2px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-lg);
  background: transparent;
  color: var(--p-text-color);
  font: inherit;
  cursor: pointer;
  transition:
    border-color 0.15s,
    background 0.15s;
}

.role-selector__option i {
  font-size: 1.25rem;
  color: var(--p-primary-color);
}

.role-selector__option small {
  color: var(--p-text-muted-color);
}

.role-selector__option:hover {
  border-color: var(--p-primary-300);
}

.role-selector__option--active {
  border-color: var(--p-primary-color);
  background: color-mix(in srgb, var(--p-primary-color) 8%, transparent);
}

.role-selector__option:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

@media (max-width: 420px) {
  .role-selector {
    grid-template-columns: 1fr;
  }
}
</style>
