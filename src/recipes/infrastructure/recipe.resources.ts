import type { ApiSchema } from '@/shared/infrastructure/openapi/api-schema'

/** DTOs de Recipes, generados desde el OpenAPI del backend (no editar a mano: npm run api:types). */

export type IngredientResource = ApiSchema<'IngredientResponse'>
export type StepResource = ApiSchema<'StepResponse'>
export type RecipeSummaryResource = ApiSchema<'RecipeSummaryResponse'>
export type RecipeDetailResource = ApiSchema<'RecipeDetailResponse'>

export type IngredientRequestResource = ApiSchema<'IngredientRequest'>
export type StepRequestResource = ApiSchema<'StepRequest'>
export type UpdateRecipeResource = ApiSchema<'UpdateRecipeRequest'>
export type CreateRecipeResource = ApiSchema<'CreateRecipeRequest'>
