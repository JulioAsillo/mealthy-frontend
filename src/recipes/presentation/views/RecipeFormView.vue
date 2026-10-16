<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import Message from 'primevue/message'
import Skeleton from 'primevue/skeleton'
import FormField from '@/shared/presentation/components/FormField.vue'
import { useApiForm } from '@/shared/presentation/composables/useApiForm'
import { useNotify } from '@/shared/presentation/composables/useNotify'
import { useAuthStore } from '@/security/application/auth.store'
import { useRecipesStore } from '@/recipes/application/recipes.store'
import { emptyRecipeForm, type RecipeForm } from '@/recipes/domain/model/recipe-forms'
import type { RecipeDetail } from '@/recipes/domain/model/recipe.entity'
import { RecipeAssembler } from '@/recipes/infrastructure/recipe.assembler'
import IngredientsEditor from '@/recipes/presentation/components/IngredientsEditor.vue'
import StepsEditor from '@/recipes/presentation/components/StepsEditor.vue'
import ImageUploader from '@/media/presentation/components/ImageUploader.vue'

/** Sin id = crear; con id = editar. */
const props = defineProps<{ id?: number }>()

const router = useRouter()
const notify = useNotify()
const auth = useAuthStore()
const store = useRecipesStore()
const { submitting, submit, fieldError, generalError, idempotencyKey } = useApiForm()

const isEdit = computed(() => props.id !== undefined)
const original = ref<RecipeDetail | null>(null)
const loading = ref(false)
const form = reactive<RecipeForm>(emptyRecipeForm())
const uploadingImage = ref(false)

watch(
  () => props.id,
  async (id) => {
    if (id === undefined) {
      Object.assign(form, emptyRecipeForm())
      return
    }
    loading.value = true
    try {
      const recipe = await store.getRecipe(id, { force: true })
      if (recipe.authorId !== auth.user?.id) {
        await router.replace({ name: 'forbidden' })
        return
      }
      original.value = recipe
      Object.assign(form, RecipeAssembler.toForm(recipe))
    } catch (e) {
      notify.error(e, 'No se pudo cargar la receta')
      await router.replace({ name: 'recipes' })
    } finally {
      loading.value = false
    }
  },
  { immediate: true },
)

const canSubmit = computed(
  () =>
    form.title.trim().length >= 3 &&
    form.description.trim() !== '' &&
    (form.preparationMinutes ?? 0) >= 1 &&
    (form.servings ?? 0) >= 1 &&
    !uploadingImage.value,
)

async function onSubmit() {
  let saved: RecipeDetail | undefined
  const ok = await submit(async () => {
    saved = original.value
      ? await store.updateRecipe(original.value, form)
      : await store.createRecipe(form, idempotencyKey.value)
  })
  if (ok && saved) {
    notify.success(isEdit.value ? 'Receta actualizada' : '¡Receta publicada!')
    await router.replace({ name: 'recipe-detail', params: { id: saved.id } })
  }
}

function cancel() {
  if (original.value) void router.push({ name: 'recipe-detail', params: { id: original.value.id } })
  else void router.push({ name: 'recipes' })
}
</script>

<template>
  <section class="recipe-form container">
    <header class="recipe-form__header">
      <h1>{{ isEdit ? 'Editar receta' : 'Nueva receta' }}</h1>
      <p>Comparte tu receta con la comunidad Mealthy.</p>
    </header>

    <div v-if="loading" class="recipe-form__loading">
      <Skeleton height="3rem" />
      <Skeleton height="8rem" />
      <Skeleton height="12rem" />
    </div>

    <form v-else novalidate @submit.prevent="onSubmit">
      <Message v-if="generalError()" severity="error" :closable="false" class="recipe-form__error">
        {{ generalError() }}
      </Message>

      <div class="recipe-form__card">
        <h2>Información general</h2>
        <div class="recipe-form__general">
          <div class="recipe-form__fields">
            <FormField label="Título" for="title" :error="fieldError('title')">
              <InputText
                id="title"
                v-model="form.title"
                maxlength="120"
                :invalid="!!fieldError('title')"
              />
            </FormField>

            <FormField label="Descripción" for="description" :error="fieldError('description')">
              <Textarea
                id="description"
                v-model="form.description"
                rows="4"
                auto-resize
                maxlength="2000"
                :invalid="!!fieldError('description')"
              />
            </FormField>

            <div class="recipe-form__row">
              <FormField
                label="Tiempo (minutos)"
                for="minutes"
                :error="fieldError('preparationMinutes')"
              >
                <InputNumber
                  v-model="form.preparationMinutes"
                  input-id="minutes"
                  :min="1"
                  :max="1440"
                  suffix=" min"
                  show-buttons
                  :invalid="!!fieldError('preparationMinutes')"
                />
              </FormField>
              <FormField label="Porciones" for="servings" :error="fieldError('servings')">
                <InputNumber
                  v-model="form.servings"
                  input-id="servings"
                  :min="1"
                  :max="100"
                  show-buttons
                  :invalid="!!fieldError('servings')"
                />
              </FormField>
            </div>
          </div>

          <FormField
            label="Foto"
            for="recipe-photo"
            optional
            :error="fieldError('imageId')"
            class="recipe-form__photo"
          >
            <ImageUploader
              v-model="form.imageId"
              v-model:busy="uploadingImage"
              input-id="recipe-photo"
              :alt="form.title || 'Foto de la receta'"
            />
          </FormField>
        </div>
      </div>

      <div class="recipe-form__card">
        <h2>Ingredientes</h2>
        <IngredientsEditor v-model="form.ingredients" />
      </div>

      <div class="recipe-form__card">
        <h2>Pasos</h2>
        <p v-if="isEdit" class="recipe-form__note">
          Los pasos nuevos se agregan al final de la receta.
        </p>
        <StepsEditor v-model="form.steps" :reorderable="!isEdit" />
      </div>

      <div class="recipe-form__actions">
        <Button type="button" label="Cancelar" severity="secondary" text @click="cancel" />
        <Button
          type="submit"
          :label="isEdit ? 'Guardar cambios' : 'Publicar receta'"
          icon="pi pi-check"
          :loading="submitting"
          :disabled="!canSubmit"
        />
      </div>
    </form>
  </section>
</template>

<style scoped>
.recipe-form {
  padding-block: 2rem 3rem;
  max-width: 900px;
}

.recipe-form__header h1 {
  margin: 0;
}

.recipe-form__header p {
  margin: 0.25rem 0 1.5rem;
  color: var(--p-text-muted-color);
}

.recipe-form__loading {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recipe-form__error {
  margin-bottom: 1rem;
}

.recipe-form__card {
  background: var(--p-content-background);
  border: 1px solid var(--p-content-border-color);
  border-radius: var(--p-border-radius-xl);
  padding: 1.5rem;
  margin-bottom: 1.25rem;
}

.recipe-form__card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
}

.recipe-form__general {
  display: grid;
  grid-template-columns: 1fr 240px;
  gap: 1.5rem;
}

.recipe-form__fields {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.recipe-form__row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.recipe-form__row :deep(.p-inputnumber) {
  width: 100%;
}

.recipe-form__photo {
  align-self: start;
}

.recipe-form__note {
  margin: -0.5rem 0 1rem;
  font-size: 0.85rem;
  color: var(--p-text-muted-color);
}

.recipe-form__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
}

@media (max-width: 720px) {
  .recipe-form__general {
    grid-template-columns: 1fr;
  }

  .recipe-form__photo {
    order: -1;
  }
}

@media (max-width: 480px) {
  .recipe-form__row {
    grid-template-columns: 1fr;
  }
}
</style>
