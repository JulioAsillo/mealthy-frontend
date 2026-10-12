<script setup lang="ts">
import Button from 'primevue/button'
import heroImage from '@/assets/images/healthy-foods.png'

const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
</script>

<template>
  <section class="home container">
    <div class="home__text">
      <h1>Bienvenido a {{ appName }}</h1>
      <p>
        Descubre cómo alimentarse saludablemente puede ser rápido y delicioso con nuestras recetas
        saludables.
      </p>
      <Button label="Únete" icon="pi pi-arrow-right" icon-pos="right" disabled />
    </div>
    <img :src="heroImage" alt="Platos saludables" class="home__image" />
  </section>
</template>

<style scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  gap: 2rem;
  min-height: calc(100vh - 64px - 53px);
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
