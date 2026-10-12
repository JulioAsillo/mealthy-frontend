import type { SignUpRole } from './role'

export interface SignInForm {
  email: string
  password: string
}

export interface SignUpForm {
  role: SignUpRole
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  phone: string
  birthDate: Date | null
}

export interface UpdateProfileForm {
  firstName: string
  lastName: string
  phone: string
  birthDate: Date | null
}
