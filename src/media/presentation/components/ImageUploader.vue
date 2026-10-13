<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import Button from 'primevue/button'
import ProgressBar from 'primevue/progressbar'
import Message from 'primevue/message'
import { useImageUpload, type UploadPhase } from '@/media/application/use-image-upload'
import MediaImage from './MediaImage.vue'

/** Id de la imagen asociada (null = sin foto). Es lo que el formulario envía como imageId. */
const imageId = defineModel<number | null>({ required: true })
/** true mientras se sube: el formulario padre deshabilita "Guardar". */
const busy = defineModel<boolean>('busy', { default: false })

defineProps<{ alt: string; inputId: string; icon?: string }>()

const { phase, error, busy: uploading, upload, cancel } = useImageUpload()
const input = ref<HTMLInputElement | null>(null)
/** Vista previa instantánea del archivo elegido (object URL), antes de que el backend termine. */
const localPreview = ref<string | null>(null)

watch(uploading, (value) => (busy.value = value), { immediate: true })

const PHASE_LABEL: Partial<Record<UploadPhase, string>> = {
  compressing: 'Optimizando imagen…',
  uploading: 'Subiendo…',
  processing: 'Procesando…',
}
const statusText = computed(() => PHASE_LABEL[phase.value])
const hasImage = computed(() => imageId.value !== null || localPreview.value !== null)

async function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  target.value = '' // permite volver a elegir el mismo archivo
  if (!file) return

  setPreview(URL.createObjectURL(file))
  const id = await upload(file)
  if (id !== null) imageId.value = id
  else setPreview(null) // falló o se canceló: vuelve a mostrarse la foto anterior
}

function remove() {
  cancel()
  setPreview(null)
  imageId.value = null
}

function setPreview(url: string | null) {
  if (localPreview.value) URL.revokeObjectURL(localPreview.value)
  localPreview.value = url
}

onBeforeUnmount(() => setPreview(null))
</script>

<template>
  <div class="image-uploader">
    <div class="image-uploader__preview">
      <img v-if="localPreview" :src="localPreview" :alt="alt" class="image-uploader__img" />
      <MediaImage v-else :image-id="imageId" variant="md" :alt="alt" :icon="icon" />

      <div v-if="uploading" class="image-uploader__overlay" role="status" aria-live="polite">
        <ProgressBar mode="indeterminate" class="image-uploader__progress" />
        <span>{{ statusText }}</span>
      </div>
    </div>

    <input :id="inputId" ref="input" type="file" accept="image/*" hidden @change="onFileChange" />

    <div class="image-uploader__actions">
      <Button
        type="button"
        :label="hasImage ? 'Cambiar foto' : 'Subir foto'"
        icon="pi pi-upload"
        size="small"
        severity="secondary"
        outlined
        :disabled="uploading"
        @click="input?.click()"
      />
      <Button
        v-if="hasImage"
        type="button"
        label="Quitar"
        icon="pi pi-trash"
        size="small"
        severity="danger"
        text
        @click="remove"
      />
    </div>

    <Message v-if="error" severity="error" size="small" :closable="false">{{ error }}</Message>
    <small v-else class="image-uploader__hint">Se optimiza automáticamente antes de subirla.</small>
  </div>
</template>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.image-uploader__preview {
  position: relative;
  aspect-ratio: 4 / 3;
  border-radius: var(--p-border-radius-lg);
  overflow: hidden;
  border: 1px solid var(--p-content-border-color);
}

.image-uploader__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-uploader__overlay {
  position: absolute;
  inset: auto 0 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  background: color-mix(in srgb, var(--p-content-background) 85%, transparent);
  font-size: 0.8rem;
}

.image-uploader__progress {
  height: 4px;
}

.image-uploader__actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.image-uploader__hint {
  color: var(--p-text-muted-color);
}
</style>
