/** Fila editable de ingrediente. key = id local estable para v-for; id = id del backend si ya existe. */
export interface IngredientDraft {
  key: string
  id?: number
  name: string
  quantity: number | null
  unit: string
}

export interface StepDraft {
  key: string
  id?: number
  description: string
}

export interface RecipeForm {
  title: string
  description: string
  preparationMinutes: number | null
  servings: number | null
  photoUrl: string
  ingredients: IngredientDraft[]
  steps: StepDraft[]
}

let counter = 0
export const newKey = (): string => `draft-${Date.now()}-${counter++}`

export const emptyIngredient = (): IngredientDraft => ({
  key: newKey(),
  name: '',
  quantity: null,
  unit: '',
})

export const emptyStep = (): StepDraft => ({ key: newKey(), description: '' })

export const emptyRecipeForm = (): RecipeForm => ({
  title: '',
  description: '',
  preparationMinutes: 30,
  servings: 2,
  photoUrl: '',
  ingredients: [emptyIngredient()],
  steps: [emptyStep()],
})
