<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useMyStoreStore } from '@/marketplace/application/my-store.store'
import { PRODUCT_CATEGORIES, type Product } from '@/marketplace/domain/model/marketplace.entity'
import { emptyProductForm, type ProductForm } from '@/marketplace/domain/model/marketplace-forms'
import { MarketplaceAssembler } from '@/marketplace/infrastructure/marketplace.assembler'

const visible = defineModel<boolean>('visible', { required: true })
const props = defineProps<{ product: Product | null }>()
const emit = defineEmits<{ saved: [product: Product] }>()

const myStore = useMyStoreStore()
const { submitting, submit, fieldError, generalError, reset } = useApiForm()
const form = reactive<ProductForm>(emptyProductForm())

watch(visible, (open) => {
  if (!open) return
  reset()
  Object.assign(
    form,
    props.product ? MarketplaceAssembler.toProductForm(props.product) : emptyProductForm(),
  )
})

const canSubmit = computed(
  () =>
    form.name.trim().length >= 2 &&
    form.category.trim().length >= 2 &&
    (form.price ?? 0) > 0 &&
    form.unit.trim() !== '' &&
    (form.stock ?? -1) >= 0,
)

async function onSubmit() {
  let saved: Product | undefined
  const ok = await submit(async () => {
    saved = await myStore.saveProduct(form, props.product?.id)
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
    :header="product ? 'Editar producto' : 'Nuevo producto'"
    :style="{ width: 'min(520px, calc(100vw - 2rem))' }"
    :draggable="false"
  >
    <form id="product-form" class="dialog-form" novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false">{{
        generalError()
      }}</Message>

      <FormField label="Nombre" for="product-name" :error="fieldError('name')">
        <InputText
          id="product-name"
          v-model="form.name"
          maxlength="120"
          :invalid="!!fieldError('name')"
        />
      </FormField>

      <FormField label="Categoría" for="product-category" :error="fieldError('category')">
        <InputText
          id="product-category"
          v-model="form.category"
          maxlength="50"
          list="product-categories"
          :invalid="!!fieldError('category')"
        />
        <datalist id="product-categories">
          <option v-for="c in PRODUCT_CATEGORIES" :key="c" :value="c" />
        </datalist>
      </FormField>

      <div class="dialog-form__row">
        <FormField label="Precio" for="product-price" :error="fieldError('price')">
          <InputNumber
            v-model="form.price"
            input-id="product-price"
            mode="currency"
            currency="PEN"
            locale="es-PE"
            :min="0.01"
            :invalid="!!fieldError('price')"
          />
        </FormField>
        <FormField label="Unidad" for="product-unit" :error="fieldError('unit')">
          <InputText
            id="product-unit"
            v-model="form.unit"
            maxlength="20"
            placeholder="kg, unid, paquete…"
          />
        </FormField>
      </div>

      <FormField label="Stock" for="product-stock" :error="fieldError('stock')">
        <InputNumber v-model="form.stock" input-id="product-stock" :min="0" show-buttons />
      </FormField>

      <FormField
        label="URL de la foto"
        for="product-photo"
        optional
        :error="fieldError('photoUrl')"
      >
        <InputText
          id="product-photo"
          v-model="form.photoUrl"
          type="url"
          maxlength="500"
          placeholder="https://…"
        />
      </FormField>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="visible = false" />
      <Button
        type="submit"
        form="product-form"
        :label="product ? 'Guardar' : 'Agregar producto'"
        icon="pi pi-check"
        :loading="submitting"
        :disabled="!canSubmit"
      />
    </template>
  </Dialog>
</template>

<style scoped>
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dialog-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.dialog-form :deep(.p-inputnumber) {
  width: 100%;
}
</style>
