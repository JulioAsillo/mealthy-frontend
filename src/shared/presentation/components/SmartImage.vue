<script setup lang="ts">
import { ref, watch } from 'vue'

/** Imagen con lazy-load y placeholder si falta o falla la URL. */
const props = defineProps<{ src: string | null; alt: string; icon?: string }>()

const failed = ref(false)
watch(
  () => props.src,
  () => (failed.value = false),
)
</script>

<template>
  <img
    v-if="src && !failed"
    :src="src"
    :alt="alt"
    loading="lazy"
    referrerpolicy="no-referrer"
    class="smart-image"
    @error="failed = true"
  />
  <div v-else class="smart-image smart-image--placeholder" role="img" :aria-label="alt">
    <i :class="icon ?? 'pi pi-image'" aria-hidden="true" />
  </div>
</template>

<style scoped>
.smart-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.smart-image--placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200));
  color: var(--p-primary-500);
  font-size: 2rem;
}
</style>
