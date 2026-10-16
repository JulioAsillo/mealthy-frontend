import { daysFromToday } from '@/shared/domain/model/date-only'

/** Un insumo de la despensa del usuario. */
export interface Supply {
  id: number
  name: string
  quantity: number
  unit: string
  expiresOn: Date | null
  createdAt: Date
  updatedAt: Date | null
  /** Versión para concurrencia optimista (If-Match). */
  version: number
}

export type ExpirationStatus = 'expired' | 'soon' | 'ok' | 'none'

/** Días de anticipación para avisar "por vencer". */
export const EXPIRING_SOON_DAYS = 3

export function expirationStatus(supply: Pick<Supply, 'expiresOn'>): ExpirationStatus {
  if (!supply.expiresOn) return 'none'
  const days = daysFromToday(supply.expiresOn)
  if (days < 0) return 'expired'
  if (days <= EXPIRING_SOON_DAYS) return 'soon'
  return 'ok'
}

export function expirationLabel(supply: Pick<Supply, 'expiresOn'>): string {
  if (!supply.expiresOn) return 'Sin fecha'
  const days = daysFromToday(supply.expiresOn)
  if (days < -1) return `Venció hace ${-days} días`
  if (days === -1) return 'Venció ayer'
  if (days === 0) return 'Vence hoy'
  if (days === 1) return 'Vence mañana'
  return `Vence en ${days} días`
}
