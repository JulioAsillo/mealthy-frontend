<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useConfirm } from 'primevue/useconfirm'
import Button from 'primevue/button'
import InputNumber from 'primevue/inputnumber'
import Skeleton from 'primevue/skeleton'
import Checkbox from 'primevue/checkbox'
import EmptyState from '@/shared/presentation/components/EmptyState.vue'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { ApiError } from '@/shared/domain/model/api-error'
import { useAuthStore } from '@/security/application/auth.store'
import { useRecipesStore } from '@/recipes/application/recipes.store'
import {
  formatDuration,
  scaleQuantity,
  type RecipeDetail,
} from '@/recipes/domain/model/recipe.entity'
import RecipeImage from '@/recipes/presentation/components/RecipeImage.vue'
import { usePantryStore } from '@/pantry/application/pantry.store'

const props = defineProps<{ id: number }>()

const router = useRouter()
const confirm = useConfirm()
const notify = useNotify()
const auth = useAuthStore()
const store = useRecipesStore()
const pantry = usePantryStore()

/** Solo los clientes tienen despensa: se carga en segundo plano y sin bloquear la vista. */
const canUsePantry = computed(() => auth.hasRole('Customer'))
watch(
  canUsePantry,
  (enabled) => {
    if (enabled) pantry.load().catch(() => undefined)
  },
  { immediate: true },
)

const recipe = ref<RecipeDetail | null>(null)
const notFound = ref(false)
const servings = ref(1)
const doneSteps = ref<Set<number>>(new Set())

watch(
  () => props.id,
  async (id) => {
    recipe.value = null
    notFound.value = false
    doneSteps.value = new Set()
    try {
      recipe.value = await store.getRecipe(id)
      servings.value = recipe.value.servings
    } catch (e) {
      if (e instanceof ApiError && e.isNotFound) notFound.value = true
      else notify.error(e, 'No se pudo cargar la receta')
    }
  },
  { immediate: true },
)

const isAuthor = computed(() => !!recipe.value && auth.user?.id === recipe.value.authorId)

const quantityFormat = new Intl.NumberFormat('es-PE', { maximumFractionDigits: 2 })

const scaledIngredients = computed(() =>
  (recipe.value?.ingredients ?? []).map((i) => ({
    ...i,
    display: quantityFormat.format(
      scaleQuantity(i.quantity, recipe.value!.servings, servings.value || 1),
    ),
    inPantry: canUsePantry.value && pantry.loaded ? !!pantry.findMatch(i.name) : null,
  })),
)

const pantrySummary = computed(() => {
  const list = scaledIngredients.value
  if (!list.length || list[0]!.inPantry === null) return null
  const have = list.filter((i) => i.inPantry).length
  return { have, total: list.length }
})

const progress = computed(() => {
  const total = recipe.value?.steps.length ?? 0
  return total ? Math.round((doneSteps.value.size / total) * 100) : 0
})

function toggleStep(id: number) {
  const next = new Set(doneSteps.value)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  doneSteps.value = next
}

function confirmDelete() {
  confirm.require({
    header: 'Eliminar receta',
    message: `¿Seguro que quieres eliminar “${recipe.value?.title}”? Esta acción no se puede deshacer.`,
    icon: 'pi pi-exclamation-triangle',
    rejectProps: { label: 'Cancelar', severity: 'secondary', text: true },
    acceptProps: { label: 'Eliminar', severity: 'danger' },
    accept: async () => {
      try {
        await store.deleteRecipe(props.id)
        notify.success('Receta eliminada')
        await router.replace({ name: 'recipes' })
      } catch (e) {
        notify.error(e, 'No se pudo eliminar')
      }
    },
  })
}
</script>

<template>
  <section class="detail container">
    <RouterLink :to="{ name: 'recipes' }" class="detail__back">
      <i class="pi pi-arrow-left" aria-hidden="true" /> Recetas
    </RouterLink>

    <EmptyState
      v-if="notFound"
      icon="pi pi-search"
      title="Receta no encontrada"
      description="Puede que haya sido eliminada."
    />

    <div v-else-if="!recipe" class="detail__loading">
      <Skeleton height="320px" border-radius="16px" />
      <Skeleton width="60%" height="2rem" />
      <Skeleton width="90%" />
      <Skeleton width="80%" />
    </div>

    <article v-else>
      <div class="detail__hero">
        <RecipeImage :src="recipe.photoUrl" :alt="recipe.title" />
      </div>

      <header class="detail__header">
        <div>
          <h1>{{ recipe.title }}</h1>
          <div class="detail__meta">
            <span
              ><i class="pi pi-clock" aria-hidden="true" />
              {{ formatDuration(recipe.preparationMinutes) }}</span
            >
            <span
              ><i class="pi pi-users" aria-hidden="true" /> {{ recipe.servings }} porciones</span
            >
            <span><i class="pi pi-list" aria-hidden="true" /> {{ recipe.steps.length }} pasos</span>
          </div>
        </div>
        <div v-if="isAuthor" class="detail__actions">
          <RouterLink
            :to="{ name: 'recipe-edit', params: { id: recipe.id } }"
            custom
            v-slot="{ navigate }"
          >
            <Button
              label="Editar"
              icon="pi pi-pencil"
              severity="secondary"
              outlined
              @click="navigate"
            />
          </RouterLink>
          <Button
            label="Eliminar"
            icon="pi pi-trash"
            severity="danger"
            text
            @click="confirmDelete"
          />
        </div>
      </header>

      <p class="detail__description">{{ recipe.description }}</p>

      <div class="detail__columns">
        <aside class="detail__panel">
          <div class="detail__panel-header">
            <h2>Ingredientes</h2>
            <label class="detail__servings">
              <span>Porciones</span>
              <InputNumber
                v-model="servings"
                show-buttons
                button-layout="horizontal"
                :min="1"
                :max="100"
                input-class="detail__servings-input"
                increment-button-icon="pi pi-plus"
                decrement-button-icon="pi pi-minus"
                aria-label="Porciones"
              />
            </label>
          </div>
          <p v-if="servings !== recipe.servings" class="detail__scaled-note">
            Cantidades ajustadas de {{ recipe.servings }} a {{ servings }} porciones.
          </p>
          <p v-if="pantrySummary" class="detail__pantry-summary">
            <i class="pi pi-shopping-bag" aria-hidden="true" />
            Tienes {{ pantrySummary.have }} de {{ pantrySummary.total }} ingredientes en tu despensa
          </p>
          <ul v-if="scaledIngredients.length" class="detail__ingredients">
            <li v-for="ingredient in scaledIngredients" :key="ingredient.id">
              <span class="detail__qty">{{ ingredient.display }} {{ ingredient.unit }}</span>
              <span class="detail__ingredient-name">{{ ingredient.name }}</span>
              <i
                v-if="ingredient.inPantry"
                class="pi pi-check-circle detail__have"
                title="Lo tienes en tu despensa"
                aria-label="En tu despensa"
              />
              <RouterLink
                v-else-if="ingredient.inPantry === false"
                :to="{ name: 'market', query: { tab: 'products', q: ingredient.name } }"
                class="detail__missing"
                :title="`Buscar ${ingredient.name} en el mercado`"
                :aria-label="`Te falta ${ingredient.name}: buscar en el mercado`"
              >
                <i class="pi pi-cart-plus" aria-hidden="true" />
              </RouterLink>
            </li>
          </ul>
          <p v-else class="detail__muted">Sin ingredientes registrados.</p>
        </aside>

        <div class="detail__panel">
          <div class="detail__panel-header">
            <h2>Preparación</h2>
            <span v-if="recipe.steps.length" class="detail__progress"
              >{{ progress }}% completado</span
            >
          </div>
          <ol v-if="recipe.steps.length" class="detail__steps">
            <li
              v-for="step in recipe.steps"
              :key="step.id"
              :class="{ 'detail__step--done': doneSteps.has(step.id) }"
            >
              <Checkbox
                :model-value="doneSteps.has(step.id)"
                binary
                :input-id="`step-${step.id}`"
                @update:model-value="toggleStep(step.id)"
              />
              <label :for="`step-${step.id}`">
                <strong>Paso {{ step.order }}</strong>
                {{ step.description }}
              </label>
            </li>
          </ol>
          <p v-else class="detail__muted">Sin pasos registrados.</p>
        </div>
      </div>
    </article>
  </section>
</template>

<style scoped>
.detail {
  padding-block: 1.5rem 3rem;
  max-width: 1000px;
}

.detail__back {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  text-decoration: none;
  margin-bottom: 1rem;
}

.detail__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.detail__hero {
  height: clamp(220px, 40vw, 380px);
  border-radius: var(--p-border-radius-xl);
  overflow: hidden;
}

.detail__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
}

.detail__header h1 {
  margin: 0 0 0.5rem;
  font-size: clamp(1.6rem, 3vw, 2.2rem);
}

.detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  color: var(--p-text-muted-color);
}

.detail__meta i {
  color: var(--p-primary-color);
  margin-right: 0.3rem;
}

.detail__actions {
  display: flex;
  gap: 0.5rem;
}

.detail__description {
  line-height: 1.7;
  white-space: pre-line;
  margin: 1.25rem 0 2rem;
}

.detail__columns {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 2fr;
  gap: 1.5rem;
  align-items: start;
}

.detail__panel {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  padding: 1.25rem;
}

.detail__panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.detail__panel-header h2 {
  margin: 0;
  font-size: 1.15rem;
}

.detail__servings {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.detail__servings :deep(.detail__servings-input) {
  width: 3rem;
  text-align: center;
}

.detail__scaled-note {
  font-size: 0.8rem;
  color: var(--p-primary-600);
  margin: -0.5rem 0 0.75rem;
}

.detail__ingredients {
  list-style: none;
  padding: 0;
  margin: 0;
}

.detail__ingredients li {
  display: flex;
  gap: 0.75rem;
  padding: 0.6rem 0;
  border-bottom: 1px dashed var(--p-content-border-color);
}

.detail__ingredients li:last-child {
  border-bottom: 0;
}

.detail__pantry-summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.5rem 0.75rem;
  border-radius: var(--p-border-radius-md);
  background: color-mix(in srgb, var(--p-primary-color) 8%, transparent);
  margin: 0 0 0.75rem;
}

.detail__ingredient-name {
  flex: 1;
}

.detail__have {
  color: var(--p-green-500);
}

.detail__missing {
  color: var(--p-text-muted-color);
  text-decoration: none;
}

.detail__missing:hover {
  color: var(--p-primary-color);
}

.detail__qty {
  font-weight: 700;
  color: var(--p-primary-color);
  min-width: 5.5rem;
}

.detail__progress {
  font-size: 0.85rem;
  color: var(--p-primary-600);
  font-weight: 600;
}

.detail__steps {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.detail__steps li {
  display: flex;
  gap: 0.75rem;
  align-items: flex-start;
  padding: 0.75rem;
  border-radius: var(--p-border-radius-lg);
  background: var(--p-surface-50);
  transition: opacity 0.15s;
}

.app-dark .detail__steps li {
  background: var(--p-surface-800);
}

.detail__steps label {
  cursor: pointer;
  line-height: 1.6;
}

.detail__steps strong {
  display: block;
  color: var(--p-primary-color);
}

.detail__step--done {
  opacity: 0.55;
}

.detail__step--done label {
  text-decoration: line-through;
}

.detail__muted {
  color: var(--p-text-muted-color);
  margin: 0;
}

@media (max-width: 768px) {
  .detail__columns {
    grid-template-columns: 1fr;
  }
}
</style>
