<script setup lang="ts">
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import { emptyIngredient, type IngredientDraft } from '@/recipes/domain/model/recipe-forms'

const model = defineModel<IngredientDraft[]>({ required: true })

const UNIT_SUGGESTIONS = ['g', 'kg', 'ml', 'l', 'unid', 'taza', 'cda', 'cdta', 'pizca']

function add() {
  model.value = [...model.value, emptyIngredient()]
}

function remove(key: string) {
  model.value = model.value.filter((i) => i.key !== key)
}
</script>

<template>
  <div class="ingredients">
    <div class="ingredients__head" aria-hidden="true">
      <span>Ingrediente</span>
      <span>Cantidad</span>
      <span>Unidad</span>
      <span />
    </div>

    <div v-for="(item, index) in model" :key="item.key" class="ingredients__row">
      <InputText
        v-model="item.name"
        :aria-label="`Nombre del ingrediente ${index + 1}`"
        placeholder="Ej. Avena"
        maxlength="100"
      />
      <InputNumber
        v-model="item.quantity"
        :aria-label="`Cantidad del ingrediente ${index + 1}`"
        :min="0.01"
        :max-fraction-digits="2"
        locale="es-PE"
        placeholder="0"
      />
      <InputText
        v-model="item.unit"
        :aria-label="`Unidad del ingrediente ${index + 1}`"
        placeholder="g"
        maxlength="20"
        list="unit-suggestions"
      />
      <Button
        icon="pi pi-times"
        severity="secondary"
        text
        rounded
        :aria-label="`Quitar ingrediente ${index + 1}`"
        :disabled="model.length === 1"
        @click="remove(item.key)"
      />
    </div>

    <datalist id="unit-suggestions">
      <option v-for="unit in UNIT_SUGGESTIONS" :key="unit" :value="unit" />
    </datalist>

    <Button
      label="Agregar ingrediente"
      icon="pi pi-plus"
      severity="secondary"
      text
      class="ingredients__add"
      :disabled="model.length >= 50"
      @click="add"
    />
  </div>
</template>

<style scoped>
.ingredients {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ingredients__head,
.ingredients__row {
  display: grid;
  grid-template-columns: 1fr 110px 90px 40px;
  gap: 0.5rem;
  align-items: center;
}

.ingredients__head {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--p-text-muted-color);
}

.ingredients__row :deep(.p-inputnumber-input),
.ingredients__row :deep(.p-inputtext) {
  width: 100%;
}

.ingredients__add {
  align-self: flex-start;
}

@media (max-width: 560px) {
  .ingredients__head {
    display: none;
  }

  .ingredients__row {
    grid-template-columns: 1fr 1fr 40px;
    padding-bottom: 0.75rem;
    border-bottom: 1px dashed var(--p-content-border-color);
  }

  .ingredients__row > :first-child {
    grid-column: 1 / -1;
  }
}
</style>
