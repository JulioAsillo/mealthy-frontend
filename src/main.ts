import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'
import Tooltip from 'primevue/tooltip'

import App from './App.vue'
import router from './router'
import { MealthyPreset, DARK_MODE_SELECTOR } from '@/shared/presentation/theme/mealthy.preset'
import { setupHttp } from '@/shared/application/setup-http'
import { setupAuth } from '@/security/application/setup-auth'
import { installGuards } from './router/guards'
import { useThemeStore } from '@/shared/application/theme.store'

import './assets/styles/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
// Aplica el tema antes del primer render para evitar el destello claro→oscuro.
useThemeStore(pinia)
// Guards antes de app.use(router): así protegen también la primera navegación.
installGuards(router, pinia)
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: MealthyPreset,
    options: {
      darkModeSelector: DARK_MODE_SELECTOR,
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)
app.directive('tooltip', Tooltip)

// Debe ir después de Pinia y ToastService.
setupHttp(app, pinia)
setupAuth(pinia, router)

app.mount('#app')
