import type { UserRole } from '@/types/database'

export const SITE_OWNER_EMAIL = 'mandrewschaeffer@gmail.com'
export const DEFAULT_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000001'

const USER_ROLES: UserRole[] = ['client_viewer', 'client_editor', 'developer', 'admin']

export function normalizeEmail(email: string | null | undefined): string {
  return email?.trim().toLowerCase() ?? ''
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  return normalizeEmail(email) === SITE_OWNER_EMAIL
}

export function isUserRole(value: string | null | undefined): value is UserRole {
  return Boolean(value && USER_ROLES.includes(value as UserRole))
}

export function resolveUserRole(email: string | null | undefined, fallback?: string | null): UserRole {
  if (isOwnerEmail(email)) return 'admin'
  if (isUserRole(fallback)) return fallback
  return 'client_editor'
}

export function isInternalRole(role: UserRole | null | undefined): boolean {
  return role === 'developer' || role === 'admin'
}
