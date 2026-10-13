<script setup lang="ts">
import { formatDuration, type RecipeSummary } from '@/recipes/domain/model/recipe.entity'
import MediaImage from '@/media/presentation/components/MediaImage.vue'

defineProps<{ recipe: RecipeSummary }>()
</script>

<template>
  <RouterLink :to="{ name: 'recipe-detail', params: { id: recipe.id } }" class="recipe-card">
    <div class="recipe-card__media">
      <MediaImage :image-id="recipe.imageId" variant="md" :alt="recipe.title" />
    </div>
    <div class="recipe-card__body">
      <h3 class="recipe-card__title">{{ recipe.title }}</h3>
      <p class="recipe-card__description">{{ recipe.description }}</p>
      <div class="recipe-card__meta">
        <span
          ><i class="pi pi-clock" aria-hidden="true" />
          {{ formatDuration(recipe.preparationMinutes) }}</span
        >
        <span><i class="pi pi-users" aria-hidden="true" /> {{ recipe.servings }} porc.</span>
      </div>
    </div>
  </RouterLink>
</template>

<style scoped>
.recipe-card {
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

.recipe-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgb(0 0 0 / 0.08);
}

.recipe-card:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: 2px;
}

.recipe-card__media {
  aspect-ratio: 4 / 3;
  overflow: hidden;
}

.recipe-card__body {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1rem;
  flex: 1;
}

.recipe-card__title {
  margin: 0;
  font-size: 1.05rem;
}

.recipe-card__description {
  margin: 0;
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.recipe-card__meta {
  display: flex;
  gap: 1rem;
  margin-top: auto;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.recipe-card__meta i {
  color: var(--p-primary-color);
  margin-right: 0.25rem;
}
</style>
