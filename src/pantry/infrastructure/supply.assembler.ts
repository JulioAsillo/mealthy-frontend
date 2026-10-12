import { fromDateOnly, toDateOnly } from '@/shared/domain/model/date-only'
import type { Supply } from '@/pantry/domain/model/supply.entity'
import type { SupplyForm } from '@/pantry/domain/model/supply-form'
import type { SupplyRequestResource, SupplyResource } from './supply.resources'

export const SupplyAssembler = {
  toEntity(r: SupplyResource): Supply {
    return {
      ...r,
      expiresOn: fromDateOnly(r.expiresOn),
      createdAt: new Date(r.createdAt),
      updatedAt: r.updatedAt ? new Date(r.updatedAt) : null,
    }
  },

  toForm(s: Supply): SupplyForm {
    return { name: s.name, quantity: s.quantity, unit: s.unit, expiresOn: s.expiresOn }
  },

  toRequest(form: SupplyForm): SupplyRequestResource {
    return {
      name: form.name.trim(),
      quantity: form.quantity ?? 0,
      unit: form.unit.trim(),
      expiresOn: toDateOnly(form.expiresOn),
    }
  },
}
