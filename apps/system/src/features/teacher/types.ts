import type { Enums, Tables } from '@/types/database'

export type Teacher = Tables<'teachers'>
export type ProgressNote = Tables<'progress_notes'>
export type BookingStatus = Enums<'booking_status'>
export type AttendanceStatus = Enums<'attendance_status'>

export type StudentContact = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'phone' | 'avatar_url'>

/** Una reserva de la sesión con la alumna y, si el admin ya la marcó, su asistencia. */
export interface RosterEntry {
  id: string
  status: BookingStatus
  waitlist_position: number | null
  created_at: string
  student: StudentContact | null
  attendance: { status: AttendanceStatus } | null
}

export interface NoteWithSession extends ProgressNote {
  session: (Pick<Tables<'class_sessions'>, 'id' | 'starts_at' | 'title'> & { class_type: { name: string } | null }) | null
}

export interface TeacherStudent {
  student: StudentContact
  /** Reservas confirmadas con este profe en el periodo. */
  classesBooked: number
  lastClassAt: string
}

export interface NewNoteInput {
  studentId: string
  authorId: string
  sessionId: string | null
  body: string
}

/** Reserva confirmada de una sesión de este profe (base de la lista de alumnas). */
export interface StudentBookingRow {
  student: StudentContact | null
  session: { starts_at: string }
}
