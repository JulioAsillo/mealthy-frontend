<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import Button from 'primevue/button'
import heroImage from '@/assets/images/hero.webp'
import { useAuthStore } from '@/security/application/auth.store'
import { homeRouteFor } from '@/security/application/home-route'
import type { RouteLocationRaw } from 'vue-router'

const appName = import.meta.env.VITE_APP_NAME ?? 'Mealthy'
const auth = useAuthStore()
const { isAuthenticated, user, role } = storeToRefs(auth)

interface Feature {
  icon: string
  title: string
  text: string
  to: RouteLocationRaw
  cta: string
}

const ALL_FEATURES: Feature[] = [
  {
    icon: 'pi pi-book',
    title: 'Recetas saludables',
    text: 'Ajusta las porciones al instante y sigue cada paso en modo cocina.',
    to: { name: 'recipes' },
    cta: 'Ver recetas',
  },
  {
    icon: 'pi pi-shopping-bag',
    title: 'Tu despensa al día',
    text: 'Registra lo que tienes y recibe avisos antes de que algo se venza.',
    to: { name: 'pantry' },
    cta: 'Ir a mi despensa',
  },
  {
    icon: 'pi pi-shop',
    title: 'Mercado local',
    text: 'Encuentra los ingredientes que te faltan en tiendas de la comunidad.',
    to: { name: 'market' },
    cta: 'Explorar mercado',
  },
]

/** El dueño de tienda no tiene despensa: ve "Mi tienda" en su lugar. */
const features = computed<Feature[]>(() =>
  role.value === 'StoreOwner'
    ? ALL_FEATURES.map((f) =>
        f.to && typeof f.to === 'object' && 'name' in f.to && f.to.name === 'pantry'
          ? {
              icon: 'pi pi-briefcase',
              title: 'Tu tienda online',
              text: 'Publica tus productos y controla tu stock desde un solo lugar.',
              to: { name: 'my-store' },
              cta: 'Ir a mi tienda',
            }
          : f,
      )
    : ALL_FEATURES,
)

const greeting = computed(() =>
  isAuthenticated.value ? `Hola, ${user.value?.firstName} 👋` : `Bienvenido a ${appName}`,
)
</script>

<template>
  <div class="home">
    <section class="hero container">
      <div class="hero__text">
        <span class="hero__eyebrow">Come rico, come sano</span>
        <h1>{{ greeting }}</h1>
        <p>
          Descubre cómo alimentarse saludablemente puede ser rápido y delicioso: recetas de la
          comunidad, tu despensa organizada y un mercado con productos frescos.
        </p>
        <div class="hero__actions">
          <RouterLink
            :to="isAuthenticated ? homeRouteFor(role) : { name: 'recipes' }"
            custom
            v-slot="{ navigate }"
          >
            <Button
              :label="isAuthenticated ? 'Continuar' : 'Explorar recetas'"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="large"
              @click="navigate"
            />
          </RouterLink>
          <RouterLink
            v-if="!isAuthenticated"
            :to="{ name: 'sign-up' }"
            custom
            v-slot="{ navigate }"
          >
            <Button
              label="Crear cuenta gratis"
              severity="secondary"
              outlined
              size="large"
              @click="navigate"
            />
          </RouterLink>
        </div>
      </div>
      <div class="hero__media">
        <img
          :src="heroImage"
          alt="Ingredientes frescos: salmón, tomates, palta y frutos secos"
          width="1000"
          height="1000"
          fetchpriority="high"
        />
      </div>
    </section>

    <section class="features container" aria-labelledby="features-title">
      <h2 id="features-title" class="features__title">Todo lo que necesitas para comer mejor</h2>
      <div class="features__grid">
        <article v-for="f in features" :key="f.title" class="feature">
          <span class="feature__icon"><i :class="f.icon" aria-hidden="true" /></span>
          <h3>{{ f.title }}</h3>
          <p>{{ f.text }}</p>
          <RouterLink :to="f.to" class="feature__link">
            {{ f.cta }} <i class="pi pi-arrow-right" aria-hidden="true" />
          </RouterLink>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.home {
  overflow-x: clip;
}

.hero {
  display: grid;
  grid-template-columns: 1.1fr 1fr;
  align-items: center;
  gap: 3rem;
  padding-block: 3rem 2rem;
}

.hero__eyebrow {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 999px;
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
  color: var(--p-primary-color);
  font-weight: 700;
  font-size: 0.8rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hero__text h1 {
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 1.1;
  margin: 1rem 0;
  color: var(--p-text-color);
}

.hero__text p {
  font-size: 1.125rem;
  line-height: 1.7;
  color: var(--p-text-muted-color);
  margin: 0 0 2rem;
  max-width: 34rem;
}

.hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.hero__media {
  position: relative;
}

.hero__media::before {
  content: '';
  position: absolute;
  inset: 8% -4% -4% 8%;
  border-radius: 40% 60% 55% 45% / 50% 40% 60% 50%;
  background: color-mix(in srgb, var(--p-primary-color) 18%, transparent);
  z-index: 0;
}

.hero__media img {
  position: relative;
  z-index: 1;
  width: 100%;
  height: auto;
  max-height: 520px;
  object-fit: contain;
}

.features {
  padding-block: 2rem 4rem;
}

.features__title {
  text-align: center;
  font-size: clamp(1.4rem, 3vw, 1.9rem);
  margin: 0 0 2rem;
}

.features__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.25rem;
}

.feature {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.5rem;
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
}

.feature__icon {
  display: grid;
  place-items: center;
  width: 3rem;
  height: 3rem;
  border-radius: var(--p-border-radius-lg);
  background: color-mix(in srgb, var(--p-primary-color) 12%, transparent);
  color: var(--p-primary-color);
  font-size: 1.3rem;
}

.feature h3 {
  margin: 0.5rem 0 0;
}

.feature p {
  margin: 0;
  color: var(--p-text-muted-color);
  line-height: 1.6;
  flex: 1;
}

.feature__link {
  margin-top: 0.5rem;
  text-decoration: none;
}

@media (max-width: 860px) {
  .hero {
    grid-template-columns: 1fr;
    padding-top: 2rem;
  }

  .hero__media {
    order: -1;
    max-width: 420px;
    margin-inline: auto;
  }
}
</style>
