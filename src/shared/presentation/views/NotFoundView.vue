<script setup lang="ts">
import Button from 'primevue/button'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <section class="not-found container">
    <span class="not-found__code">404</span>
    <h1>Página no encontrada</h1>
    <p>
      La ruta <code>{{ route.fullPath }}</code> no existe.
    </p>
    <RouterLink to="/" custom v-slot="{ navigate }">
      <Button label="Volver al inicio" icon="pi pi-home" @click="navigate" />
    </RouterLink>
  </section>
</template>

<style scoped>
.not-found {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
}

.not-found__code {
  font-size: 6rem;
  font-weight: 800;
  color: var(--p-primary-color);
  line-height: 1;
}
</style>
