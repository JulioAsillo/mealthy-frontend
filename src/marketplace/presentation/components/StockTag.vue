<script setup lang="ts">
import { computed } from 'vue'
import Tag from 'primevue/tag'
import { stockStatus, type Product } from '@/marketplace/domain/model/marketplace.entity'

const props = defineProps<{ product: Pick<Product, 'stock' | 'unit'> }>()
const status = computed(() => stockStatus(props.product))
</script>

<template>
  <Tag v-if="status === 'out'" severity="danger" value="Agotado" rounded />
  <Tag v-else-if="status === 'low'" severity="warn" :value="`Últimas ${product.stock}`" rounded />
  <Tag v-else severity="success" :value="`${product.stock} en stock`" rounded />
</template>
