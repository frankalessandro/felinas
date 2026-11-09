import { supabase } from '@/lib/supabase'
import { unwrap, unwrapMaybe } from '@/lib/errors'
import type { NewNoteInput, NoteWithSession, ProgressNote, RosterEntry, StudentBookingRow, Teacher } from '../types'

export async function getTeacherByProfile(profileId: string): Promise<Teacher | null> {
  return unwrapMaybe(await supabase.from('teachers').select('*').eq('profile_id', profileId).is('deleted_at', null).maybeSingle())
}

export async function getTeacherById(teacherId: string): Promise<Teacher | null> {
  return unwrapMaybe(await supabase.from('teachers').select('*').eq('id', teacherId).is('deleted_at', null).maybeSingle())
}

export async function listActiveTeachers(): Promise<Teacher[]> {
  return unwrap(await supabase.from('teachers').select('*').eq('active', true).is('deleted_at', null).order('full_name'))
}

const ROSTER_SELECT = `
  id, status, waitlist_position, created_at,
  student:profiles!bookings_student_id_fkey ( id, full_name, phone, avatar_url ),
  attendance ( status )
` as const

export async function listSessionRoster(sessionId: string): Promise<RosterEntry[]> {
  return unwrap(
    await supabase.from('bookings').select(ROSTER_SELECT).eq('session_id', sessionId).neq('status', 'cancelled').order('created_at'),
  )
}

/** Notas que este profe escribió en una sesión (RLS ya limita a las suyas). */
export async function listSessionNotes(sessionId: string): Promise<ProgressNote[]> {
  return unwrap(await supabase.from('progress_notes').select('*').eq('session_id', sessionId).order('created_at', { ascending: false }))
}

const NOTE_WITH_SESSION_SELECT = `
  *,
  session:class_sessions ( id, starts_at, title, class_type:class_types ( name ) )
` as const

export async function listStudentNotes(studentId: string): Promise<NoteWithSession[]> {
  return unwrap(
    await supabase.from('progress_notes').select(NOTE_WITH_SESSION_SELECT).eq('student_id', studentId).order('created_at', { ascending: false }),
  )
}

export async function createNote(input: NewNoteInput): Promise<ProgressNote> {
  return unwrap(
    await supabase
      .from('progress_notes')
      .insert({ student_id: input.studentId, author_id: input.authorId, session_id: input.sessionId, body: input.body })
      .select()
      .single(),
  )
}

const STUDENT_BOOKINGS_SELECT = `
  student:profiles!bookings_student_id_fkey ( id, full_name, phone, avatar_url ),
  session:class_sessions!inner ( starts_at, teacher_id, status )
` as const

/** Reservas confirmadas de sesiones de este profe desde `fromIso`. */
export async function listStudentBookings(teacherId: string, fromIso: string): Promise<StudentBookingRow[]> {
  return unwrap(
    await supabase
      .from('bookings')
      .select(STUDENT_BOOKINGS_SELECT)
      .eq('status', 'booked')
      .eq('session.teacher_id', teacherId)
      .eq('session.status', 'scheduled')
      .gte('session.starts_at', fromIso),
  )
}
