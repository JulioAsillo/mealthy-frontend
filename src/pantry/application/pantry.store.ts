import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { expirationStatus, type Supply } from '@/pantry/domain/model/supply.entity'
import type { SupplyForm } from '@/pantry/domain/model/supply-form'
import { namesMatch } from '@/pantry/domain/model/ingredient-match'
import { PANTRY_MAX_PAGE_SIZE, pantryApi } from '@/pantry/infrastructure/pantry.api'
import { SupplyAssembler } from '@/pantry/infrastructure/supply.assembler'

/** Tope de seguridad: 10 páginas x 100 = 1000 insumos. */
const MAX_PAGES = 10

/**
 * La despensa es personal y pequeña: se carga completa una vez y
 * búsqueda, filtros y orden se hacen en el cliente (respuesta instantánea).
 */
export const usePantryStore = defineStore('pantry', () => {
  const supplies = ref<Supply[]>([])
  const loaded = ref(false)
  const loading = ref(false)

  const stats = computed(() => {
    const counts = { total: supplies.value.length, soon: 0, expired: 0 }
    for (const s of supplies.value) {
      const status = expirationStatus(s)
      if (status === 'soon') counts.soon++
      if (status === 'expired') counts.expired++
    }
    return counts
  })

  async function load({ force = false } = {}): Promise<void> {
    if (loaded.value && !force) return
    loading.value = true
    try {
      const all: Supply[] = []
      for (let page = 1; page <= MAX_PAGES; page++) {
        const result = await pantryApi.list(page)
        all.push(...result.items.map(SupplyAssembler.toEntity))
        if (all.length >= result.totalItems || result.items.length < PANTRY_MAX_PAGE_SIZE) break
      }
      supplies.value = all
      loaded.value = true
    } finally {
      loading.value = false
    }
  }

  async function create(form: SupplyForm, idempotencyKey?: string): Promise<Supply> {
    const supply = SupplyAssembler.toEntity(
      await pantryApi.create(SupplyAssembler.toRequest(form), idempotencyKey),
    )
    supplies.value = [supply, ...supplies.value]
    return supply
  }

  async function update(id: number, form: SupplyForm): Promise<Supply> {
    const version = supplies.value.find((s) => s.id === id)?.version
    const supply = SupplyAssembler.toEntity(
      await pantryApi.update(id, SupplyAssembler.toRequest(form), version),
    )
    supplies.value = supplies.value.map((s) => (s.id === id ? supply : s))
    return supply
  }

  /** Borrado optimista: desaparece al instante y se restaura si el backend falla. */
  async function remove(id: number): Promise<void> {
    const snapshot = supplies.value
    supplies.value = supplies.value.filter((s) => s.id !== id)
    try {
      await pantryApi.remove(id)
    } catch (e) {
      supplies.value = snapshot
      throw e
    }
  }

  /** ¿Tengo este ingrediente en la despensa? (usado por el detalle de receta). */
  function findMatch(ingredientName: string): Supply | undefined {
    return supplies.value.find((s) => s.quantity > 0 && namesMatch(s.name, ingredientName))
  }

  /** Al cerrar sesión no deben quedar datos de otro usuario. */
  function $reset() {
    supplies.value = []
    loaded.value = false
  }

  return { supplies, loaded, loading, stats, load, create, update, remove, findMatch, $reset }
})
