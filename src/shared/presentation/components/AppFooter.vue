<script setup lang="ts">
const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <p>{{ appName }} {{ year }} · Todos los derechos reservados</p>
  </footer>
</template>

<style scoped>
.footer {
  border-top: 1px solid var(--p-content-border-color);
  text-align: center;
  color: var(--p-text-muted-color);
  font-size: 0.875rem;
  padding: 1rem;
}

.footer p {
  margin: 0;
}
</style>
