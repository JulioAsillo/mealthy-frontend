<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Button from 'primevue/button'
import Paginator, { type PageState } from 'primevue/paginator'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { useAuthStore } from '@/security/application/auth.store'
import { RECIPES_PAGE_SIZE, useRecipesStore } from '@/recipes/application/recipes.store'
import RecipeCard from '@/recipes/presentation/components/RecipeCard.vue'
import RecipeCardSkeleton from '@/recipes/presentation/components/RecipeCardSkeleton.vue'

const route = useRoute()
const router = useRouter()
const notify = useNotify()
const auth = useAuthStore()
const store = useRecipesStore()
const { items, totalItems, loading } = storeToRefs(store)

/** La URL es la fuente de verdad (?q=&page=): se puede compartir y el botón atrás funciona. */
const queryPage = computed(() => Math.max(1, Number(route.query.page) || 1))
const querySearch = computed(() => (typeof route.query.q === 'string' ? route.query.q : ''))

const searchInput = ref(querySearch.value)
let debounce: ReturnType<typeof setTimeout> | undefined

watch(searchInput, (value) => {
  clearTimeout(debounce)
  debounce = setTimeout(() => {
    void router.replace({
      query: { ...route.query, q: value.trim() || undefined, page: undefined },
    })
  }, 350)
})

onBeforeUnmount(() => clearTimeout(debounce))

watch(
  [queryPage, querySearch],
  async ([page, search]) => {
    try {
      await store.fetchList({ page, search })
    } catch (e) {
      notify.error(e, 'No se pudieron cargar las recetas')
    }
  },
  { immediate: true },
)

function onPage(event: PageState) {
  void router.push({
    query: { ...route.query, page: event.page + 1 > 1 ? event.page + 1 : undefined },
  })
}

const first = computed(() => (queryPage.value - 1) * RECIPES_PAGE_SIZE)
const showSkeleton = computed(() => loading.value && items.value.length === 0)
</script>

<template>
  <section class="recipes container">
    <header class="recipes__header">
      <div>
        <h1>Recetas</h1>
        <p>Ideas saludables, rápidas y deliciosas de nuestra comunidad.</p>
      </div>
      <RouterLink
        v-if="auth.isAuthenticated"
        :to="{ name: 'recipe-create' }"
        custom
        v-slot="{ navigate }"
      >
        <Button label="Nueva receta" icon="pi pi-plus" @click="navigate" />
      </RouterLink>
    </header>

    <IconField class="recipes__search">
      <InputIcon class="pi pi-search" />
      <InputText
        v-model="searchInput"
        placeholder="Buscar por título…"
        aria-label="Buscar recetas"
        fluid
      />
    </IconField>

    <div v-if="showSkeleton" class="recipes__grid">
      <RecipeCardSkeleton v-for="n in 6" :key="n" />
    </div>

    <template v-else-if="items.length">
      <p class="recipes__count" aria-live="polite">
        {{ totalItems }} {{ totalItems === 1 ? 'receta' : 'recetas' }}
        <template v-if="querySearch"> para “{{ querySearch }}”</template>
      </p>
      <div class="recipes__grid" :class="{ 'recipes__grid--loading': loading }">
        <RecipeCard v-for="recipe in items" :key="recipe.id" :recipe="recipe" />
      </div>
      <Paginator
        v-if="totalItems > RECIPES_PAGE_SIZE"
        :first="first"
        :rows="RECIPES_PAGE_SIZE"
        :total-records="totalItems"
        class="recipes__paginator"
        @page="onPage"
      />
    </template>

    <EmptyState
      v-else
      icon="pi pi-book"
      :title="querySearch ? 'Sin resultados' : 'Aún no hay recetas'"
      :description="
        querySearch
          ? `No encontramos recetas para “${querySearch}”. Prueba con otra palabra.`
          : 'Sé la primera persona en compartir una receta saludable.'
      "
    >
      <RouterLink
        v-if="auth.isAuthenticated && !querySearch"
        :to="{ name: 'recipe-create' }"
        custom
        v-slot="{ navigate }"
      >
        <Button label="Crear receta" icon="pi pi-plus" @click="navigate" />
      </RouterLink>
    </EmptyState>
  </section>
</template>

<style scoped>
.recipes {
  padding-block: 2rem 3rem;
}

.recipes__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.recipes__header h1 {
  margin: 0;
  font-size: 2rem;
}

.recipes__header p {
  margin: 0.25rem 0 0;
  color: var(--p-text-muted-color);
}

.recipes__search {
  max-width: 480px;
  margin-bottom: 1.25rem;
}

.recipes__count {
  color: var(--p-text-muted-color);
  font-size: 0.9rem;
  margin: 0 0 1rem;
}

.recipes__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
  transition: opacity 0.15s;
}

.recipes__grid--loading {
  opacity: 0.6;
}

.recipes__paginator {
  margin-top: 2rem;
  background: transparent;
}
</style>
