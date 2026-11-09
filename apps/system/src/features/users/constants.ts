import type { BadgeTone } from '@/components/ui'
import type { UserRole, UserStatus } from './types'

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  teacher: 'Profe',
  student: 'Alumna',
}

export const ROLE_TONES: Record<UserRole, BadgeTone> = {
  admin: 'rosa',
  teacher: 'dorado',
  student: 'neutral',
}

export const STATUS_LABELS: Record<UserStatus, { label: string; tone: BadgeTone }> = {
  pending: { label: 'Pendiente', tone: 'warn' },
  active: { label: 'Activa', tone: 'ok' },
  inactive: { label: 'Inactiva', tone: 'neutral' },
}

export const ASSIGNABLE_ROLES: UserRole[] = ['student', 'teacher', 'admin']

/** Radix Select no admite valores vacíos: este centinela representa "sin plan por ahora". */
export const NO_PLAN = 'none'
