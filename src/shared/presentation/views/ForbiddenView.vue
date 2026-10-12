<script setup lang="ts">
import Button from 'primevue/button'
</script>

<template>
  <section class="status-page container">
    <span class="status-page__code">403</span>
    <h1>Acceso denegado</h1>
    <p>No tienes permisos para ver esta página.</p>
    <RouterLink to="/" custom v-slot="{ navigate }">
      <Button label="Volver al inicio" icon="pi pi-home" @click="navigate" />
    </RouterLink>
  </section>
</template>

<style scoped>
.status-page {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 0.5rem;
}

.status-page__code {
  font-size: 6rem;
  font-weight: 800;
  color: var(--p-primary-color);
  line-height: 1;
}
</style>
