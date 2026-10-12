/** DTOs espejo de Recipes/Interfaces/Rest/Resources del backend. */

export interface IngredientResource {
  id: number
  name: string
  quantity: number
  unit: string
}

export interface StepResource {
  id: number
  order: number
  description: string
}

export interface RecipeSummaryResource {
  id: number
  title: string
  description: string
  preparationMinutes: number
  servings: number
  photoUrl: string | null
  authorId: number
  createdAt: string
}

export interface RecipeDetailResource extends RecipeSummaryResource {
  updatedAt: string | null
  ingredients: IngredientResource[]
  steps: StepResource[]
}

export interface IngredientRequestResource {
  name: string
  quantity: number
  unit: string
}

export interface StepRequestResource {
  description: string
}

export interface UpdateRecipeResource {
  title: string
  description: string
  preparationMinutes: number
  servings: number
  photoUrl: string | null
}

export interface CreateRecipeResource extends UpdateRecipeResource {
  ingredients: IngredientRequestResource[]
  steps: StepRequestResource[]
}
