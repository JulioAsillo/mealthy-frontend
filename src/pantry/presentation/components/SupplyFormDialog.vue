<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { emptySupplyForm, type SupplyForm } from '@/pantry/domain/model/supply-form'
import type { Supply } from '@/pantry/domain/model/supply.entity'
import { SupplyAssembler } from '@/pantry/infrastructure/supply.assembler'
import { usePantryStore } from '@/pantry/application/pantry.store'

const visible = defineModel<boolean>('visible', { required: true })
/** null = crear; Supply = editar. */
const props = defineProps<{ supply: Supply | null }>()
const emit = defineEmits<{ saved: [supply: Supply] }>()

const store = usePantryStore()

const { submitting, submit, fieldError, generalError, reset, idempotencyKey } = useApiForm()
const form = reactive<SupplyForm>(emptySupplyForm())

const UNITS = ['unid', 'g', 'kg', 'ml', 'l', 'taza', 'paquete', 'lata']

watch(visible, (open) => {
  if (!open) return
  reset()
  Object.assign(form, props.supply ? SupplyAssembler.toForm(props.supply) : emptySupplyForm())
})

const canSubmit = computed(
  () => form.name.trim() !== '' && form.unit.trim() !== '' && (form.quantity ?? -1) >= 0,
)

async function onSubmit() {
  let saved: Supply | undefined
  const ok = await submit(async () => {
    saved = props.supply
      ? await store.update(props.supply.id, form)
      : await store.create(form, idempotencyKey.value)
  })
  if (ok && saved) {
    emit('saved', saved)
    visible.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="supply ? 'Editar insumo' : 'Agregar a la despensa'"
    :style="{ width: 'min(480px, calc(100vw - 2rem))' }"
    :draggable="false"
  >
    <form id="supply-form" class="supply-form" novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false">
        {{ generalError() }}
      </Message>

      <FormField label="Nombre" for="supply-name" :error="fieldError('name')">
        <InputText
          id="supply-name"
          v-model="form.name"
          maxlength="100"
          placeholder="Ej. Avena"
          autofocus
          :invalid="!!fieldError('name')"
        />
      </FormField>

      <div class="supply-form__row">
        <FormField label="Cantidad" for="supply-qty" :error="fieldError('quantity')">
          <InputNumber
            v-model="form.quantity"
            input-id="supply-qty"
            :min="0"
            :max-fraction-digits="2"
            locale="es-PE"
            show-buttons
            :invalid="!!fieldError('quantity')"
          />
        </FormField>
        <FormField label="Unidad" for="supply-unit" :error="fieldError('unit')">
          <InputText
            id="supply-unit"
            v-model="form.unit"
            maxlength="20"
            list="supply-units"
            :invalid="!!fieldError('unit')"
          />
          <datalist id="supply-units">
            <option v-for="u in UNITS" :key="u" :value="u" />
          </datalist>
        </FormField>
      </div>

      <FormField
        label="Fecha de vencimiento"
        for="supply-expires"
        optional
        :error="fieldError('expiresOn')"
      >
        <DatePicker
          v-model="form.expiresOn"
          input-id="supply-expires"
          date-format="dd/mm/yy"
          show-icon
          show-button-bar
          :invalid="!!fieldError('expiresOn')"
        />
      </FormField>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="visible = false" />
      <Button
        type="submit"
        form="supply-form"
        :label="supply ? 'Guardar' : 'Agregar'"
        icon="pi pi-check"
        :loading="submitting"
        :disabled="!canSubmit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.supply-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.supply-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.supply-form__row :deep(.p-inputnumber) {
  width: 100%;
}
</style>
