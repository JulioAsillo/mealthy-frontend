import type { PagedResult } from '@/shared/domain/model/paged-result'
import type { RecipeDetail, RecipeSummary } from '@/recipes/domain/model/recipe.entity'
import type { IngredientDraft, RecipeForm, StepDraft } from '@/recipes/domain/model/recipe-forms'
import { newKey } from '@/recipes/domain/model/recipe-forms'
import type {
  CreateRecipeResource,
  IngredientRequestResource,
  RecipeDetailResource,
  RecipeSummaryResource,
  StepRequestResource,
  UpdateRecipeResource,
} from './recipe.resources'

const isFilledIngredient = (i: IngredientDraft) =>
  i.name.trim() !== '' && i.unit.trim() !== '' && (i.quantity ?? 0) > 0

const isFilledStep = (s: StepDraft) => s.description.trim() !== ''

export const RecipeAssembler = {
  toSummary(r: RecipeSummaryResource): RecipeSummary {
    return { ...r, createdAt: new Date(r.createdAt) }
  },

  toDetail(r: RecipeDetailResource): RecipeDetail {
    return {
      ...r,
      createdAt: new Date(r.createdAt),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
      ingredients: [...r.ingredients],
      steps: [...r.steps].sort((a, b) => a.order - b.order),
    }
  },

  toSummaryPage(page: PagedResult<RecipeSummaryResource>): PagedResult<RecipeSummary> {
    return { ...page, items: page.items.map(RecipeAssembler.toSummary) }
  },

  toForm(r: RecipeDetail): RecipeForm {
    return {
      title: r.title,
      description: r.description,
      preparationMinutes: r.preparationMinutes,
      servings: r.servings,
      photoUrl: r.photoUrl ?? '',
      ingredients: r.ingredients.map((i) => ({ key: newKey(), ...i })),
      steps: r.steps.map((s) => ({ key: newKey(), id: s.id, description: s.description })),
    }
  },

  toIngredientRequest(i: IngredientDraft): IngredientRequestResource {
    return { name: i.name.trim(), quantity: i.quantity ?? 0, unit: i.unit.trim() }
  },

  toStepRequest(s: StepDraft): StepRequestResource {
    return { description: s.description.trim() }
  },

  toUpdateResource(form: RecipeForm): UpdateRecipeResource {
    return {
      title: form.title.trim(),
      description: form.description.trim(),
      preparationMinutes: form.preparationMinutes ?? 0,
      servings: form.servings ?? 0,
      photoUrl: form.photoUrl.trim() || null,
    }
  },

  /** Las filas vacías se ignoran: el usuario puede dejar una fila en blanco sin romper el envío. */
  toCreateResource(form: RecipeForm): CreateRecipeResource {
    return {
      ...RecipeAssembler.toUpdateResource(form),
      ingredients: form.ingredients
        .filter(isFilledIngredient)
        .map(RecipeAssembler.toIngredientRequest),
      steps: form.steps.filter(isFilledStep).map(RecipeAssembler.toStepRequest),
    }
  },

  isFilledIngredient,
  isFilledStep,
}
