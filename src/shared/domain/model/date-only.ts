/**
 * Helpers para DateOnly del backend ("yyyy-MM-dd").
 * Se trabaja en hora local para evitar el desfase de new Date('2026-01-31') (UTC) en Lima.
 */
export function toDateOnly(date: Date | null): string | null {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function fromDateOnly(value: string | null): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

/** Días enteros desde hoy hasta la fecha (negativo = ya pasó). */
export function daysFromToday(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(date)
  target.setHours(0, 0, 0, 0)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
