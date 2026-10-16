export interface Ingredient {
  id: number
  name: string
  quantity: number
  unit: string
}

export interface Step {
  id: number
  order: number
  description: string
}

export interface RecipeSummary {
  id: number
  title: string
  description: string
  preparationMinutes: number
  servings: number
  imageId: number | null
  authorId: number
  createdAt: Date
}

export interface RecipeDetail extends RecipeSummary {
  updatedAt: Date | null
  /** Versión para concurrencia optimista (If-Match). */
  version: number
  ingredients: Ingredient[]
  steps: Step[]
}

/** "1 h 15 min" / "45 min" */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m} min`
  return m === 0 ? `${h} h` : `${h} h ${m} min`
}

/** Escala una cantidad a otro número de porciones (2 decimales máx.). */
export function scaleQuantity(quantity: number, from: number, to: number): number {
  if (from <= 0) return quantity
  return Math.round(((quantity * to) / from) * 100) / 100
}
