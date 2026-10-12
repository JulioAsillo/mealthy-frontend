import type { RouteLocationNormalized, RouteRecordRaw } from 'vue-router'

/** Convierte :id a número; ids no numéricos quedan como NaN y el router los manda a 404. */
const idProp = (route: RouteLocationNormalized) => ({ id: Number(route.params.id) })

export const recipesRoutes: RouteRecordRaw[] = [
  {
    path: 'recipes',
    name: 'recipes',
    component: () => import('./presentation/views/RecipeListView.vue'),
    meta: { title: 'Recetas' },
  },
  {
    path: 'recipes/new',
    name: 'recipe-create',
    component: () => import('./presentation/views/RecipeFormView.vue'),
    meta: { title: 'Nueva receta', requiresAuth: true },
  },
  {
    path: 'recipes/:id(\\d+)',
    name: 'recipe-detail',
    component: () => import('./presentation/views/RecipeDetailView.vue'),
    props: idProp,
    meta: { title: 'Receta' },
  },
  {
    path: 'recipes/:id(\\d+)/edit',
    name: 'recipe-edit',
    component: () => import('./presentation/views/RecipeFormView.vue'),
    props: idProp,
    meta: { title: 'Editar receta', requiresAuth: true },
  },
]
