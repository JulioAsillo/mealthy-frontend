/**
 * El backend entrega el refresh token en el body, así que el frontend debe guardarlo.
 * localStorage permite mantener la sesión al recargar; el riesgo ante XSS se mitiga con:
 * rotación en cada uso (backend), expiración de 7 días y no usar v-html con datos externos.
 * El access token (15 min) NUNCA se persiste: vive en memoria (shared/infrastructure/token-storage).
 */
const KEY = 'mealthy.refresh_token'

export const refreshTokenStorage = {
  get(): string | null {
    try {
      return localStorage.getItem(KEY)
    } catch {
      return null
    }
  },

  set(token: string): void {
    try {
      localStorage.setItem(KEY, token)
    } catch {
      /* almacenamiento bloqueado (modo privado): la sesión durará solo esta pestaña */
    }
  },

  clear(): void {
    try {
      localStorage.removeItem(KEY)
    } catch {
      /* ignorar */
    }
  },
}
