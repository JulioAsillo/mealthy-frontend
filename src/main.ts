import { createApp } from 'vue'
import { createPinia } from 'pinia'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import ConfirmationService from 'primevue/confirmationservice'

import App from './App.vue'
import router from './router'
import { MealthyPreset, DARK_MODE_SELECTOR } from '@/shared/presentation/theme/mealthy.preset'

import './assets/styles/main.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  ripple: true,
  theme: {
    preset: MealthyPreset,
    options: {
      darkModeSelector: DARK_MODE_SELECTOR,
      // Capa CSS para que nuestros estilos ganen sin !important.
      cssLayer: false,
    },
  },
})
app.use(ToastService)
app.use(ConfirmationService)

app.mount('#app')
