import { computed, ref } from 'vue'
import { defineStore } from 'pinia'

/** Estado transversal de la interfaz (carga global). */
export const useUiStore = defineStore('ui', () => {
  const pendingRequests = ref(0)

  const isLoading = computed(() => pendingRequests.value > 0)

  function requestStarted() {
    pendingRequests.value++
  }

  function requestFinished() {
    pendingRequests.value = Math.max(0, pendingRequests.value - 1)
  }

  return { pendingRequests, isLoading, requestStarted, requestFinished }
})
