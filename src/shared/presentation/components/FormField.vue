<script setup lang="ts">
defineProps<{
  label: string
  for: string
  error?: string
  hint?: string
  optional?: boolean
}>()
</script>

<template>
  <div class="form-field">
    <label :for="$props.for" class="form-field__label">
      {{ label }}
      <span v-if="optional" class="form-field__optional">(opcional)</span>
    </label>
    <slot />
    <small v-if="error" :id="`${$props.for}-error`" class="form-field__error" role="alert">
      {{ error }}
    </small>
    <small v-else-if="hint" class="form-field__hint">{{ hint }}</small>
  </div>
</template>

<style scoped>
.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
}

.form-field__label {
  font-weight: 600;
  font-size: 0.875rem;
}

.form-field__optional {
  font-weight: 400;
  color: var(--p-text-muted-color);
}

.form-field__error {
  color: var(--p-red-500);
}

.form-field__hint {
  color: var(--p-text-muted-color);
}

.form-field :deep(.p-inputtext),
.form-field :deep(.p-password),
.form-field :deep(.p-datepicker) {
  width: 100%;
}
</style>
