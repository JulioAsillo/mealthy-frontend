<script setup lang="ts">
defineProps<{ icon?: string; title: string; description?: string }>()
</script>

<template>
  <div class="empty-state">
    <i :class="icon ?? 'pi pi-inbox'" aria-hidden="true" />
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
    <slot />
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.5rem;
  padding: 3rem 1rem;
  color: var(--p-text-muted-color);
}

.empty-state i {
  font-size: 2.5rem;
  color: var(--p-primary-300);
}

.empty-state h3 {
  margin: 0.5rem 0 0;
  color: var(--p-text-color);
}

.empty-state p {
  margin: 0 0 0.75rem;
  max-width: 420px;
}
</style>
