import type { Enums, Tables } from '@/types/database'

export type AttendanceStatus = Enums<'attendance_status'>

export interface RosterPlan {
  planName: string
  /** null en planes de mensualidad sin bolsa de clases. */
  classesRemaining: number | null
  isExpiring: boolean
}

/** Una alumna reservada en la sesión, con su marca actual (null = sin marcar). */
export interface RosterEntry {
  bookingId: string
  student: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email' | 'phone' | 'avatar_url'>
  status: AttendanceStatus | null
  plan: RosterPlan | null
}
