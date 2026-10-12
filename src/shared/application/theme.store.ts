import { computed, ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { DARK_MODE_SELECTOR } from '@/shared/presentation/theme/mealthy.preset'

export type ThemeMode = 'light' | 'dark' | 'system'

const KEY = 'mealthy.theme'
const DARK_CLASS = DARK_MODE_SELECTOR.replace('.', '')

function readStored(): ThemeMode {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

/** Preferencia de tema por navegador (conveniencia local, no se sincroniza con el backend). */
export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(readStored())
  const media = window.matchMedia('(prefers-color-scheme: dark)')
  const systemDark = ref(media.matches)
  media.addEventListener('change', (e) => (systemDark.value = e.matches))

  const isDark = computed(
    () => mode.value === 'dark' || (mode.value === 'system' && systemDark.value),
  )

  watch(
    isDark,
    (dark) => {
      document.documentElement.classList.toggle(DARK_CLASS, dark)
      document.documentElement.style.colorScheme = dark ? 'dark' : 'light'
    },
    { immediate: true },
  )

  watch(mode, (value) => {
    try {
      if (value === 'system') localStorage.removeItem(KEY)
      else localStorage.setItem(KEY, value)
    } catch {
      /* almacenamiento no disponible: el tema dura solo esta sesión */
    }
  })

  /** Alterna claro/oscuro partiendo de lo que se ve ahora. */
  function toggle() {
    mode.value = isDark.value ? 'light' : 'dark'
  }

  return { mode, isDark, toggle }
})
