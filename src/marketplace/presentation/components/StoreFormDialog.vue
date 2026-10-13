<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import FormField from '@/shared/presentation/components/FormField.vue'
import ImageUploader from '@/media/presentation/components/ImageUploader.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useMyStoreStore } from '@/marketplace/application/my-store.store'
import { RUC_PATTERN, type Store } from '@/marketplace/domain/model/marketplace.entity'
import { emptyStoreForm, type StoreForm } from '@/marketplace/domain/model/marketplace-forms'
import { MarketplaceAssembler } from '@/marketplace/infrastructure/marketplace.assembler'

const visible = defineModel<boolean>('visible', { required: true })
/** null = registrar tienda; Store = editar. */
const props = defineProps<{ store: Store | null }>()
const emit = defineEmits<{ saved: [] }>()

const myStore = useMyStoreStore()
const { submitting, submit, fieldError, generalError, reset } = useApiForm()
const form = reactive<StoreForm>(emptyStoreForm())
const uploadingImage = ref(false)

watch(
  visible,
  (open) => {
    if (!open) return
    reset()
    Object.assign(
      form,
      props.store ? MarketplaceAssembler.toStoreForm(props.store) : emptyStoreForm(),
    )
  },
  { immediate: true },
)

const rucInvalid = computed(() => !props.store && form.ruc !== '' && !RUC_PATTERN.test(form.ruc))

const canSubmit = computed(
  () =>
    form.name.trim().length >= 2 &&
    form.description.trim() !== '' &&
    (!!props.store || RUC_PATTERN.test(form.ruc)) &&
    !uploadingImage.value,
)

async function onSubmit() {
  const ok = await submit(() =>
    props.store ? myStore.updateStore(form) : myStore.createStore(form),
  )
  if (ok) {
    emit('saved')
    visible.value = false
  }
}
</script>

<template>
  <Dialog
    v-model:visible="visible"
    modal
    :header="store ? 'Editar tienda' : 'Registrar mi tienda'"
    :style="{ width: 'min(520px, calc(100vw - 2rem))' }"
    :draggable="false"
  >
    <form id="store-form" class="dialog-form" novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false">{{
        generalError()
      }}</Message>

      <FormField label="Nombre de la tienda" for="store-name" :error="fieldError('name')">
        <InputText
          id="store-name"
          v-model="form.name"
          maxlength="100"
          :invalid="!!fieldError('name')"
        />
      </FormField>

      <FormField label="Descripción" for="store-description" :error="fieldError('description')">
        <Textarea
          id="store-description"
          v-model="form.description"
          rows="3"
          auto-resize
          maxlength="1000"
          :invalid="!!fieldError('description')"
        />
      </FormField>

      <FormField
        label="RUC"
        for="store-ruc"
        :error="
          fieldError('ruc') ??
          (rucInvalid ? 'Deben ser 11 dígitos y empezar en 10, 15, 17 o 20.' : undefined)
        "
        :hint="store ? 'El RUC no se puede modificar.' : '11 dígitos'"
      >
        <InputText
          id="store-ruc"
          v-model="form.ruc"
          inputmode="numeric"
          maxlength="11"
          :disabled="!!store"
          :invalid="!!fieldError('ruc') || rucInvalid"
          @input="form.ruc = form.ruc.replace(/\D/g, '')"
        />
      </FormField>

      <FormField label="Logo o foto" for="store-photo" optional :error="fieldError('imageId')">
        <ImageUploader
          v-model="form.imageId"
          v-model:busy="uploadingImage"
          input-id="store-photo"
          :alt="form.name || 'Logo de la tienda'"
          icon="pi pi-shop"
        />
      </FormField>
    </form>

    <template #footer>
      <Button label="Cancelar" severity="secondary" text @click="visible = false" />
      <Button
        type="submit"
        form="store-form"
        :label="store ? 'Guardar' : 'Registrar tienda'"
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
</style>
