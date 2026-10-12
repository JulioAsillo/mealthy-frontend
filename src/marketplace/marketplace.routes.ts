import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

const idProp = (route: RouteLocationNormalized) => ({ id: Number(route.params.id) })

export const marketplaceRoutes: RouteRecordRaw[] = [
  {
    path: 'market',
    name: 'market',
    component: () => import('./presentation/views/MarketView.vue'),
    meta: { title: 'Mercado' },
  },
  {
    path: 'market/stores/:id(\\d+)',
    name: 'store-detail',
    component: () => import('./presentation/views/StoreDetailView.vue'),
    props: idProp,
    meta: { title: 'Tienda' },
  },
  {
    path: 'my-store',
    name: 'my-store',
    component: () => import('./presentation/views/MyStoreView.vue'),
    meta: { title: 'Mi tienda', requiresAuth: true, roles: ['StoreOwner'] },
  },
]
