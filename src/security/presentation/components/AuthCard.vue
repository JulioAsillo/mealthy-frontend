<script setup lang="ts">
import heroImage from '@/assets/images/hero.webp'

defineProps<{ title: string; subtitle?: string }>()
</script>

<template>
  <section class="auth container">
    <div class="auth__card">
      <header class="auth__header">
        <h1>{{ title }}</h1>
        <p v-if="subtitle">{{ subtitle }}</p>
      </header>
      <slot />
      <footer v-if="$slots.footer" class="auth__footer">
        <slot name="footer" />
      </footer>
    </div>
    <img :src="heroImage" alt="" class="auth__image" />
  </section>
</template>

<style scoped>
.auth {
  display: grid;
  grid-template-columns: minmax(0, 480px) 1fr;
  gap: 3rem;
  align-items: center;
  padding-block: 2.5rem;
}

.auth__card {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  padding: 2rem;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.05);
}

.auth__header h1 {
  margin: 0 0 0.25rem;
  color: var(--p-primary-color);
  font-size: 1.75rem;
}

.auth__header p {
  margin: 0 0 1.5rem;
  color: var(--p-text-muted-color);
}

.auth__footer {
  margin-top: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
}

.auth__image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

@media (max-width: 900px) {
  .auth {
    grid-template-columns: 1fr;
  }

  .auth__image {
    display: none;
  }

  .auth__card {
    padding: 1.5rem;
  }
}
</style>
