/**
 * El refresh token vive en una cookie HttpOnly: JavaScript no puede leerla (es el objetivo).
 * Este indicador NO es secreto: solo dice "hubo sesión en este navegador", para no llamar a
 * /auth/refresh al cargar la app cuando claramente no hay sesión (ese endpoint tiene rate limit).
 */
const KEY = 'mealthy.has_session'

export const sessionHint = {
  isSet(): boolean {
    try {
      return localStorage.getItem(KEY) === '1'
    } catch {
      return false
    }
  },

  set(): void {
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      /* almacenamiento bloqueado: se intentará el refresh igual en la próxima carga */
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
