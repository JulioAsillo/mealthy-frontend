<script setup lang="ts">
import Button from 'primevue/button'
import heroImage from '@/assets/images/healthy-foods.png'

const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
</script>

<template>
  <main class="home container">
    <section class="home__text">
      <h1>Bienvenido a {{ appName }}</h1>
      <p>
        Descubre cómo alimentarse saludablemente puede ser rápido y delicioso con nuestras
        recetas saludables.
      </p>
      <!-- Fase 3: enlazar a /sign-up -->
      <Button label="Únete" icon="pi pi-arrow-right" icon-pos="right" disabled />
      <small class="home__hint">Fase 1 · bootstrap listo</small>
    </section>
    <img :src="heroImage" alt="Platos saludables" class="home__image" />
  </main>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
  min-height: 100vh;
}

.home__text h1 {
  font-size: clamp(2rem, 4vw, 3rem);
  color: var(--p-primary-color);
  margin: 0 0 1rem;
}

.home__text p {
  font-size: 1.125rem;
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

.home__hint {
  display: block;
  margin-top: 1rem;
  color: var(--p-text-muted-color);
}

.home__image {
  width: 100%;
  max-height: 70vh;
  object-fit: contain;
}

@media (max-width: 768px) {
  .home {
    grid-template-columns: 1fr;
    padding-block: 2rem;
  }
}
</style>
