import type { components } from './schema'

/**
 * Atajo para los tipos generados desde el OpenAPI del backend (npm run api:types → ./schema.ts).
 * Uso en los *.resources.ts:  export type RecipeSummaryResource = ApiSchema<'RecipeSummaryResponse'>
 *
 * El nombre es el del record C# (RecipeSummaryResponse, CreateRecipeRequest…). Si el backend cambia un
 * DTO y se regeneran los tipos, `npm run type-check` falla justo donde el frontend quedó desalineado.
 */
export type ApiSchema<Name extends keyof components['schemas']> = components['schemas'][Name]
