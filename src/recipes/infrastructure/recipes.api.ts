import { api } from '@/shared/infrastructure/base-api'
import { idempotent, ifMatch } from '@/shared/infrastructure/request-headers'
import type { PagedResult } from '@/shared/domain/model/paged-result'
import type {
  CreateRecipeResource,
  IngredientRequestResource,
  IngredientResource,
  RecipeDetailResource,
  RecipeSummaryResource,
  StepRequestResource,
  StepResource,
  UpdateRecipeResource,
} from './recipe.resources'

export interface RecipeListParams {
  page?: number
  pageSize?: number
  search?: string
}

export const recipesApi = {
  list: (params: RecipeListParams, signal?: AbortSignal) =>
    api.get<PagedResult<RecipeSummaryResource>>('/recipes', {
      params: { ...params, search: params.search || undefined },
      signal,
    }),

  getById: (id: number) => api.get<RecipeDetailResource>(`/recipes/${id}`),

  create: (body: CreateRecipeResource, idempotencyKey?: string) =>
    api.post<RecipeDetailResource, CreateRecipeResource>(
      '/recipes',
      body,
      idempotent(idempotencyKey),
    ),

  update: (id: number, body: UpdateRecipeResource, version?: number) =>
    api.put<RecipeDetailResource, UpdateRecipeResource>(`/recipes/${id}`, body, ifMatch(version)),

  remove: (id: number) => api.delete(`/recipes/${id}`),

  addIngredient: (recipeId: number, body: IngredientRequestResource) =>
    api.post<IngredientResource, IngredientRequestResource>(
      `/recipes/${recipeId}/ingredients`,
      body,
    ),

  updateIngredient: (recipeId: number, id: number, body: IngredientRequestResource) =>
    api.put<IngredientResource, IngredientRequestResource>(
      `/recipes/${recipeId}/ingredients/${id}`,
      body,
    ),

  removeIngredient: (recipeId: number, id: number) =>
    api.delete(`/recipes/${recipeId}/ingredients/${id}`),

  addStep: (recipeId: number, body: StepRequestResource) =>
    api.post<StepResource, StepRequestResource>(`/recipes/${recipeId}/steps`, body),

  updateStep: (recipeId: number, id: number, body: StepRequestResource) =>
    api.put<StepResource, StepRequestResource>(`/recipes/${recipeId}/steps/${id}`, body),

  removeStep: (recipeId: number, id: number) => api.delete(`/recipes/${recipeId}/steps/${id}`),
}
