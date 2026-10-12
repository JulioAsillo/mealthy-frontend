<script setup lang="ts">
import Skeleton from 'primevue/skeleton'
</script>

<template>
  <div class="skeleton-card" aria-hidden="true">
    <Skeleton height="0" class="skeleton-card__media" />
    <div class="skeleton-card__body">
      <Skeleton width="70%" height="1.25rem" />
      <Skeleton width="100%" />
      <Skeleton width="85%" />
      <Skeleton width="50%" />
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
  background: var(--p-content-background);
}

.skeleton-card__media {
  aspect-ratio: 4 / 3;
  height: auto !important;
  border-radius: 0;
}

.skeleton-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  padding: 1rem;
}
</style>
