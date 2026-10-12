<script setup lang="ts">
import type { Store } from '@/marketplace/domain/model/marketplace.entity'
import SmartImage from '@/shared/presentation/components/SmartImage.vue'

defineProps<{ store: Store }>()
</script>

<template>
  <RouterLink :to="{ name: 'store-detail', params: { id: store.id } }" class="store-card">
    <div class="store-card__media">
      <SmartImage :src="store.photoUrl" :alt="store.name" icon="pi pi-shop" />
    </div>
    <div class="store-card__body">
      <h3>{{ store.name }}</h3>
      <p>{{ store.description }}</p>
      <span class="store-card__cta"
        >Ver productos <i class="pi pi-arrow-right" aria-hidden="true"
      /></span>
    </div>
  </RouterLink>
</template>

<style scoped>
.store-card {
  display: flex;
  flex-direction: column;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
  color: inherit;
  text-decoration: none;
  font-weight: 400;
  transition:
    transform 0.15s,
    box-shadow 0.15s;
}

.store-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.08);
}

.store-card__media {
  aspect-ratio: 16 / 9;
}

.store-card__body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.store-card__body h3 {
  margin: 0;
  font-size: 1.05rem;
}

.store-card__body p {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.store-card__cta {
  margin-top: auto;
  color: var(--p-primary-color);
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
