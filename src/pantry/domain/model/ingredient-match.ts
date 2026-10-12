/**
 * Coincidencia aproximada entre nombres de ingredientes y de la despensa:
 * sin mayúsculas, sin tildes y tolerante a plurales simples ("Fresas" ≈ "fresa").
 */
export function normalizeName(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.replace(/(es|s)$/, ''))
    .join(' ')
}

export function namesMatch(a: string, b: string): boolean {
  const x = normalizeName(a)
  const y = normalizeName(b)
  if (!x || !y) return false
  return x === y || x.includes(y) || y.includes(x)
}
