import type { Role } from './role'

export interface UserProps {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  /** Formato ISO yyyy-MM-dd (DateOnly del backend). */
  birthDate: string | null
  role: Role
  createdAt: Date
}

export class User implements UserProps {
  readonly id: number
  readonly username: string
  readonly email: string
  readonly firstName: string
  readonly lastName: string
  readonly phone: string | null
  readonly birthDate: string | null
  readonly role: Role
  readonly createdAt: Date

  constructor(props: UserProps) {
    this.id = props.id
    this.username = props.username
    this.email = props.email
    this.firstName = props.firstName
    this.lastName = props.lastName
    this.phone = props.phone
    this.birthDate = props.birthDate
    this.role = props.role
    this.createdAt = props.createdAt
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`.trim()
  }

  get initials(): string {
    return `${this.firstName.charAt(0)}${this.lastName.charAt(0)}`.toUpperCase()
  }
}
