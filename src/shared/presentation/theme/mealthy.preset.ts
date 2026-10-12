import { definePreset } from '@primeuix/themes'
import Aura from '@primeuix/themes/aura'

/**
 * Preset de Mealthy sobre Aura.
 * Primario: #f26849 (naranja del tema original de 2023).
 */
export const MealthyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fef4f1',
      100: '#fde4dd',
      200: '#fbc9bb',
      300: '#f8a68f',
      400: '#f5826a',
      500: '#f26849',
      600: '#e04a2a',
      700: '#bb3a1f',
      800: '#98321d',
      900: '#7d2e1e',
      950: '#44140b',
    },
  },
})

/** Selector CSS que activa el modo oscuro (se alterna en <html>). */
export const DARK_MODE_SELECTOR = '.app-dark'
