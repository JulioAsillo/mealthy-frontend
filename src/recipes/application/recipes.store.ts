import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isCancel } from 'axios'
import type { RecipeDetail, RecipeSummary } from '@/recipes/domain/model/recipe.entity'
import type { RecipeForm } from '@/recipes/domain/model/recipe-forms'
import { recipesApi } from '@/recipes/infrastructure/recipes.api'
import { RecipeAssembler } from '@/recipes/infrastructure/recipe.assembler'

export const RECIPES_PAGE_SIZE = 12

export const useRecipesStore = defineStore('recipes', () => {
  // ---------- Listado ----------
  const items = ref<RecipeSummary[]>([])
  const totalItems = ref(0)
  const page = ref(1)
  const search = ref('')
  const loading = ref(false)
  let listController: AbortController | null = null

  /** Cancela la búsqueda anterior si el usuario sigue escribiendo (evita respuestas desordenadas). */
  async function fetchList(params: { page: number; search: string }): Promise<void> {
    listController?.abort()
    listController = new AbortController()
    loading.value = true
    page.value = params.page
    search.value = params.search
    try {
      const result = await recipesApi.list(
        { page: params.page, pageSize: RECIPES_PAGE_SIZE, search: params.search },
        listController.signal,
      )
      const mapped = RecipeAssembler.toSummaryPage(result)
      items.value = mapped.items
      totalItems.value = mapped.totalItems
    } catch (e) {
      if (isCancel(e)) return
      throw e
    } finally {
      loading.value = false
    }
  }

  // ---------- Detalle (caché simple por id) ----------
  const cache = new Map<number, RecipeDetail>()

  async function getRecipe(id: number, { force = false } = {}): Promise<RecipeDetail> {
    const cached = cache.get(id)
    if (cached && !force) return cached
    const recipe = RecipeAssembler.toDetail(await recipesApi.getById(id))
    cache.set(id, recipe)
    return recipe
  }

  // ---------- Escritura ----------
  async function createRecipe(form: RecipeForm, idempotencyKey?: string): Promise<RecipeDetail> {
    const recipe = RecipeAssembler.toDetail(
      await recipesApi.create(RecipeAssembler.toCreateResource(form), idempotencyKey),
    )
    cache.set(recipe.id, recipe)
    return recipe
  }

  /**
   * El backend edita ingredientes y pasos en rutas anidadas, así que se sincroniza por diferencia:
   * borra los quitados, actualiza los cambiados y crea los nuevos.
   */
  async function updateRecipe(original: RecipeDetail, form: RecipeForm): Promise<RecipeDetail> {
    const id = original.id
    // If-Match con la versión que se cargó: si otro guardó entretanto, 412 y no se pisa nada
    await recipesApi.update(id, RecipeAssembler.toUpdateResource(form), original.version)

    // Ingredientes
    const keptIngredientIds = new Set(form.ingredients.flatMap((i) => (i.id ? [i.id] : [])))
    const ingredientOps: Promise<unknown>[] = []
    for (const old of original.ingredients) {
      if (!keptIngredientIds.has(old.id))
        ingredientOps.push(recipesApi.removeIngredient(id, old.id))
    }
    for (const draft of form.ingredients) {
      if (!RecipeAssembler.isFilledIngredient(draft)) continue
      const body = RecipeAssembler.toIngredientRequest(draft)
      const old = draft.id ? original.ingredients.find((i) => i.id === draft.id) : undefined
      if (!old) ingredientOps.push(recipesApi.addIngredient(id, body))
      else if (old.name !== body.name || old.quantity !== body.quantity || old.unit !== body.unit)
        ingredientOps.push(recipesApi.updateIngredient(id, old.id, body))
    }
    await Promise.all(ingredientOps)

    // Pasos: primero borrar y editar; los nuevos se crean en serie para conservar el orden.
    const keptStepIds = new Set(form.steps.flatMap((s) => (s.id ? [s.id] : [])))
    await Promise.all([
      ...original.steps
        .filter((s) => !keptStepIds.has(s.id))
        .map((s) => recipesApi.removeStep(id, s.id)),
      ...form.steps.flatMap((draft) => {
        const old = draft.id ? original.steps.find((s) => s.id === draft.id) : undefined
        const description = draft.description.trim()
        return old && description && old.description !== description
          ? [recipesApi.updateStep(id, old.id, { description })]
          : []
      }),
    ])
    for (const draft of form.steps) {
      if (!draft.id && RecipeAssembler.isFilledStep(draft)) {
        await recipesApi.addStep(id, RecipeAssembler.toStepRequest(draft))
      }
    }

    return getRecipe(id, { force: true })
  }

  async function deleteRecipe(id: number): Promise<void> {
    await recipesApi.remove(id)
    cache.delete(id)
    items.value = items.value.filter((r) => r.id !== id)
  }

  return {
    items,
    totalItems,
    page,
    search,
    loading,
    fetchList,
    getRecipe,
    createRecipe,
    updateRecipe,
    deleteRecipe,
  }
})
