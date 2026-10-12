import { User } from '@/security/domain/model/user.entity'
import { toDateOnly } from '@/shared/domain/model/date-only'
import type { SignInForm, SignUpForm, UpdateProfileForm } from '@/security/domain/model/auth-forms'
import type {
  SignInResource,
  SignUpResource,
  UpdateProfileResource,
  UserResource,
} from './auth.resources'

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
