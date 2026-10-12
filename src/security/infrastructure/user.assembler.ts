import { User } from '@/security/domain/model/user.entity'
import type { SignInForm, SignUpForm, UpdateProfileForm } from '@/security/domain/model/auth-forms'
import type {
  SignInResource,
  SignUpResource,
  UpdateProfileResource,
  UserResource,
} from './auth.resources'

/** Date local → "yyyy-MM-dd" sin desfase de zona horaria. */
function toDateOnly(date: Date | null): string | null {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** "yyyy-MM-dd" → Date local (evita que new Date('2000-01-31') reste un día en Lima). */
export function fromDateOnly(value: string | null): Date | null {
  if (!value) return null
  const [y, m, d] = value.split('-').map(Number)
  return y && m && d ? new Date(y, m - 1, d) : null
}

const emptyToNull = (value: string): string | null => value.trim() || null

export const UserAssembler = {
  toEntity(resource: UserResource): User {
    return new User({ ...resource, createdAt: new Date(resource.createdAt) })
  },

  toSignInResource(form: SignInForm): SignInResource {
    return { email: form.email.trim(), password: form.password }
  },

  toSignUpResource(form: SignUpForm): SignUpResource {
    return {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: emptyToNull(form.phone),
      birthDate: toDateOnly(form.birthDate),
      role: form.role,
    }
  },

  toUpdateProfileResource(form: UpdateProfileForm): UpdateProfileResource {
    return {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      phone: emptyToNull(form.phone),
      birthDate: toDateOnly(form.birthDate),
    }
  },
}
