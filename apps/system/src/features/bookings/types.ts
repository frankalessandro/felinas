import type { SessionWithDetails } from '@/features/schedule/types'
import type { Enums, Tables } from '@/types/database'

export type BookingStatus = Enums<'booking_status'>
export type AttendanceStatus = Enums<'attendance_status'>
export type ClassLevel = Enums<'class_level'>

export type ClassTypeOption = Pick<Tables<'class_types'>, 'id' | 'name' | 'color' | 'level'>

export type BookingAttendance = Pick<Tables<'attendance'>, 'status' | 'consumed' | 'marked_at'>

/** Reserva con su sesión y, si la academia ya la marcó, su asistencia. */
export type BookingWithSession = Tables<'bookings'> & {
  session: SessionWithDetails
  attendance: BookingAttendance | null
}

export interface BookingFilters {
  studentId: string
  statuses?: BookingStatus[]
  /** ISO UTC, inclusivo, sobre `starts_at` de la sesión. */
  from?: string
  /** ISO UTC, exclusivo. */
  to?: string
  order?: 'asc' | 'desc'
  limit?: number
}
