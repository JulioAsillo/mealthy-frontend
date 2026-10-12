/**
 * Dónde vive el access token.
 * Por defecto en memoria: no es accesible desde localStorage ante un XSS,
 * a cambio de perderse al recargar (la Fase 3 lo restaura con el refresh token).
 */
export interface TokenStorage {
  get(): string | null
  set(token: string): void
  clear(): void
}

class InMemoryTokenStorage implements TokenStorage {
  #token: string | null = null

  get(): string | null {
    return this.#token
  }

  set(token: string): void {
    this.#token = token
  }

  clear(): void {
    this.#token = null
  }
}

export const tokenStorage: TokenStorage = new InMemoryTokenStorage()
