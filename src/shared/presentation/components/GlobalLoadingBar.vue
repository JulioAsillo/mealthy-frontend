<script setup lang="ts">
import { storeToRefs } from 'pinia'
import ProgressBar from 'primevue/progressbar'
import { useUiStore } from '@/shared/application/ui.store'

const { isLoading } = storeToRefs(useUiStore())
</script>

<template>
  <Transition name="fade">
    <ProgressBar v-if="isLoading" mode="indeterminate" class="loading-bar" aria-label="Cargando" />
  </Transition>
</template>

<style scoped>
.loading-bar {
  position: fixed;
  inset: 0 0 auto 0;
  height: 3px;
  border-radius: 0;
  z-index: 1000;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
