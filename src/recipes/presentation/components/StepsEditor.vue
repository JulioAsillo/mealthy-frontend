<script setup lang="ts">
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { emptyStep, type StepDraft } from '@/recipes/domain/model/recipe-forms'

const model = defineModel<StepDraft[]>({ required: true })

/** En edición el backend no permite reordenar pasos existentes. */
const props = defineProps<{ reorderable?: boolean }>()

function add() {
  model.value = [...model.value, emptyStep()]
}

function remove(key: string) {
  model.value = model.value.filter((s) => s.key !== key)
}

function move(index: number, delta: -1 | 1) {
  const target = index + delta
  if (target < 0 || target >= model.value.length) return
  const next = [...model.value]
  const [item] = next.splice(index, 1)
  next.splice(target, 0, item!)
  model.value = next
}
</script>

<template>
  <div class="steps">
    <div v-for="(step, index) in model" :key="step.key" class="steps__row">
      <span class="steps__number" aria-hidden="true">{{ index + 1 }}</span>
      <Textarea
        v-model="step.description"
        auto-resize
        rows="2"
        maxlength="1000"
        :aria-label="`Descripción del paso ${index + 1}`"
        placeholder="Describe este paso…"
      />
      <div class="steps__actions">
        <template v-if="props.reorderable">
          <Button
            icon="pi pi-arrow-up"
            severity="secondary"
            text
            rounded
            :aria-label="`Subir paso ${index + 1}`"
            :disabled="index === 0"
            @click="move(index, -1)"
          />
          <Button
            icon="pi pi-arrow-down"
            severity="secondary"
            text
            rounded
            :aria-label="`Bajar paso ${index + 1}`"
            :disabled="index === model.length - 1"
            @click="move(index, 1)"
          />
        </template>
        <Button
          icon="pi pi-times"
          severity="secondary"
          text
          rounded
          :aria-label="`Quitar paso ${index + 1}`"
          :disabled="model.length === 1"
          @click="remove(step.key)"
        />
      </div>
    </div>

    <Button
      label="Agregar paso"
      icon="pi pi-plus"
      severity="secondary"
      text
      class="steps__add"
      :disabled="model.length >= 50"
      @click="add"
    />
  </div>
</template>

<style scoped>
.steps {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.steps__row {
  display: grid;
  grid-template-columns: 32px 1fr auto;
  gap: 0.5rem;
  align-items: start;
}

.steps__number {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: var(--p-primary-color);
  color: var(--p-primary-contrast-color);
  font-weight: 700;
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.steps__row :deep(.p-textarea) {
  width: 100%;
}

.steps__actions {
  display: flex;
}

.steps__add {
  align-self: flex-start;
}
</style>
