<script setup lang="ts">
import { computed } from 'vue'
import SmartImage from '@/shared/presentation/components/SmartImage.vue'
import type { ImageVariant } from '@/media/domain/model/image.entity'
import { imageContentUrl } from '@/media/infrastructure/media.api'

/**
 * Imagen servida por el contexto Media. La vista solo conoce el imageId y el tamaño;
 * la URL real (API → 302 → Blob Storage) es detalle de infraestructura.
 * Sin imagen, o mientras aún se procesa (404), SmartImage muestra el placeholder.
 */
const props = withDefaults(
  defineProps<{ imageId: number | null; alt: string; variant?: ImageVariant; icon?: string }>(),
  { variant: 'md', icon: undefined },
)

const src = computed(() =>
  props.imageId === null ? null : imageContentUrl(props.imageId, props.variant),
)
</script>

<template>
  <SmartImage :src="src" :alt="alt" :icon="icon" />
</template>
