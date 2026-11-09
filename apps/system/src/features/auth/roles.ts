import type { Profile, UserRole } from './types'

export const ROLE_HOME = {
  admin: '/admin',
  teacher: '/teacher',
  student: '/student',
} as const satisfies Record<UserRole, string>

export const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administración',
  teacher: 'Profesor',
  student: 'Alumna',
}

export function isApproved(profile: Profile | null): boolean {
  return profile?.status === 'active'
}
