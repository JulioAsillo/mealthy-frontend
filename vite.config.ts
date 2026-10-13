import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Con Aspire (AddViteApp) el puerto interno llega en PORT y el proxy de Aspire publica 5173.
    // Sin Aspire se usa 5173 directo: es el origen que el backend tiene en su política CORS.
    port: Number(process.env.PORT) || 5173,
    strictPort: true,
  },
})
