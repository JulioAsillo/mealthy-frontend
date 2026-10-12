<script setup lang="ts">
import { formatPrice, type Product } from '@/marketplace/domain/model/marketplace.entity'
import SmartImage from '@/shared/presentation/components/SmartImage.vue'
import StockTag from './StockTag.vue'

defineProps<{ product: Product; showStoreLink?: boolean }>()
</script>

<template>
  <article class="product-card" :class="{ 'product-card--out': product.stock <= 0 }">
    <div class="product-card__media">
      <SmartImage :src="product.photoUrl" :alt="product.name" icon="pi pi-shopping-cart" />
    </div>
    <div class="product-card__body">
      <span class="product-card__category">{{ product.category }}</span>
      <h3>{{ product.name }}</h3>
      <div class="product-card__price">
        <strong>{{ formatPrice(product.price) }}</strong>
        <span>/ {{ product.unit }}</span>
      </div>
      <div class="product-card__footer">
        <StockTag :product="product" />
        <RouterLink
          v-if="showStoreLink"
          :to="{ name: 'store-detail', params: { id: product.storeId } }"
          class="product-card__store"
        >
          Ver tienda
        </RouterLink>
      </div>
    </div>
  </article>
</template>

<style scoped>
.product-card {
  display: flex;
  flex-direction: column;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
}

.product-card--out .product-card__media {
  filter: grayscale(0.8);
  opacity: 0.7;
}

.product-card__media {
  aspect-ratio: 1;
}

.product-card__body {
  padding: 0.875rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  flex: 1;
}

.product-card__category {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--p-text-muted-color);
}

.product-card__body h3 {
  margin: 0;
  font-size: 1rem;
}

.product-card__price strong {
  font-size: 1.15rem;
  color: var(--p-primary-color);
}

.product-card__price span {
  color: var(--p-text-muted-color);
  font-size: 0.85rem;
  margin-left: 0.25rem;
}

.product-card__footer {
  margin-top: auto;
  padding-top: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.product-card__store {
  font-size: 0.85rem;
  text-decoration: none;
}
</style>
