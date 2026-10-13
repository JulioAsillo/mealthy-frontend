import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { tokenStorage } from '@/shared/infrastructure/token-storage'
import type { User } from '@/security/domain/model/user.entity'
import type { Role } from '@/security/domain/model/role'
import type { SignInForm, SignUpForm, UpdateProfileForm } from '@/security/domain/model/auth-forms'
import { authApi } from '@/security/infrastructure/auth.api'
import { usersApi } from '@/security/infrastructure/users.api'
import { sessionHint } from '@/security/infrastructure/session-hint'
import { UserAssembler } from '@/security/infrastructure/user.assembler'
import type { AuthResource } from '@/security/infrastructure/auth.resources'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const initialized = ref(false)

  const isAuthenticated = computed(() => user.value !== null)
  const role = computed<Role | null>(() => user.value?.role ?? null)

  function applySession(auth: AuthResource): void {
    tokenStorage.set(auth.token)
    sessionHint.set()
    user.value = UserAssembler.toEntity(auth.user)
  }

  /** Limpia la sesión local sin llamar al backend (sesión expirada). */
  function clearSession(): void {
    tokenStorage.clear()
    sessionHint.clear()
    user.value = null
  }

  async function signIn(form: SignInForm): Promise<void> {
    applySession(await authApi.signIn(UserAssembler.toSignInResource(form)))
  }

  async function signUp(form: SignUpForm): Promise<void> {
    applySession(await authApi.signUp(UserAssembler.toSignUpResource(form)))
  }

  async function signOut(): Promise<void> {
    clearSession()
    // Revoca el refresh token y borra la cookie; si falla, la sesión local ya está cerrada igual.
    await authApi.signOut().catch(() => undefined)
  }

  /**
   * Canjea el refresh token de la cookie HttpOnly (con rotación). Lo usa el interceptor HTTP ante
   * un 401 y la restauración de sesión al recargar. Devuelve el nuevo access token o null.
   */
  async function refreshAccessToken(): Promise<string | null> {
    if (!sessionHint.isSet()) return null
    try {
      const auth = await authApi.refresh()
      applySession(auth)
      return auth.token
    } catch {
      clearSession()
      return null
    }
  }

  let initPromise: Promise<void> | null = null

  /** Restaura la sesión una sola vez al arrancar (lo invoca el guard del router). */
  function initialize(): Promise<void> {
    initPromise ??= (async () => {
      await refreshAccessToken()
      initialized.value = true
    })()
    return initPromise
  }

  async function fetchMe(): Promise<void> {
    user.value = UserAssembler.toEntity(await usersApi.getMe())
  }

  async function updateProfile(form: UpdateProfileForm): Promise<void> {
    const updated = await usersApi.updateMe(UserAssembler.toUpdateProfileResource(form))
    user.value = UserAssembler.toEntity(updated)
  }

  function hasRole(...roles: Role[]): boolean {
    return role.value !== null && roles.includes(role.value)
  }

  return {
    user,
    initialized,
    isAuthenticated,
    role,
    signIn,
    signUp,
    signOut,
    refreshAccessToken,
    clearSession,
    initialize,
    fetchMe,
    updateProfile,
    hasRole,
  }
})
