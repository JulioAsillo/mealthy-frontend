/** Espejo del enum Role del backend (se serializa como texto). */
export const Role = {
  Customer: 'Customer',
  StoreOwner: 'StoreOwner',
  Admin: 'Admin',
} as const

export type Role = (typeof Role)[keyof typeof Role]

export const ROLE_LABELS: Record<Role, string> = {
  Customer: 'Cliente',
  StoreOwner: 'Dueño de tienda',
  Admin: 'Administrador',
}

/** Roles que un usuario puede elegir al registrarse (Admin no). */
export const SIGN_UP_ROLES = [Role.Customer, Role.StoreOwner] as const
export type SignUpRole = (typeof SIGN_UP_ROLES)[number]
