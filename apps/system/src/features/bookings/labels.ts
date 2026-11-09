import type { BadgeTone } from '@/components/ui'
import { getErrorMessage, toAppError } from '@/lib/errors'
import type { AttendanceStatus, ClassLevel } from './types'

export const LEVEL_LABEL = {
  all: 'Todos los niveles',
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
} as const satisfies Record<ClassLevel, string>

export interface AttendanceDisplay {
  label: string
  tone: BadgeTone
}

export const ATTENDANCE_DISPLAY = {
  present: { label: 'Asistió', tone: 'ok' },
  absent: { label: 'Faltó', tone: 'danger' },
  excused: { label: 'Justificada', tone: 'warn' },
} as const satisfies Record<AttendanceStatus, AttendanceDisplay>

export const ATTENDANCE_PENDING: AttendanceDisplay = { label: 'Por confirmar', tone: 'neutral' }

const BOOKING_ERROR_MESSAGES: Record<string, string> = {
  PLAN_LIMIT_REACHED: 'Ya alcanzaste el límite de tu plan para esta clase.',
  CLASS_TYPE_NOT_COVERED: 'Esta clase no está incluida en tu plan.',
  NO_ACTIVE_PLAN: 'No tienes un plan activo. Habla con la academia.',
  PLAN_FROZEN: 'Tu plan está congelado. No puedes reservar hasta que la academia lo reactive.',
  CATEGORY_QUOTA_REACHED: 'Ya usaste todas las clases de esta categoría que incluye tu plan este mes.',
  ALREADY_BOOKED: 'Ya tienes una reserva en esta clase.',
  SESSION_STARTED: 'Esta clase ya empezó.',
  SESSION_CANCELLED: 'Esta clase fue cancelada.',
  SESSION_PRIVATE: 'Las clases personalizadas las agenda la academia.',
  ALREADY_CANCELLED: 'Esta reserva ya estaba cancelada.',
}

/** Mensaje amable según el código de la base; si no hay uno propio, el mensaje (ya en español) de la base. */
export function getBookingErrorMessage(error: unknown): string {
  const { code } = toAppError(error)
  return (code && BOOKING_ERROR_MESSAGES[code]) || getErrorMessage(error)
}
