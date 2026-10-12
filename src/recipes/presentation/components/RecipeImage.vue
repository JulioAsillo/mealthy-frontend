<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ src: string | null; alt: string }>()

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
    class="recipe-image"
    @error="failed = true"
  />
  <div v-else class="recipe-image recipe-image--placeholder" role="img" :aria-label="alt">
    <i class="pi pi-image" aria-hidden="true" />
  </div>
</template>

<style scoped>
.recipe-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.recipe-image--placeholder {
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, var(--p-primary-100), var(--p-primary-200));
  color: var(--p-primary-500);
  font-size: 2rem;
}

.app-dark .recipe-image--placeholder {
  background: linear-gradient(135deg, var(--p-surface-800), var(--p-surface-700));
  color: var(--p-primary-400);
}
</style>
