import { supabase } from '@/lib/supabase'
import { unwrap, unwrapMaybe } from '@/lib/errors'

const BOOKING_SELECT = `
  id, status, created_at, cancelled_at, waitlist_position,
  session:class_sessions (
    id, starts_at, ends_at, status, kind, title,
    class_type:class_types ( id, name, color ),
    teacher:teachers ( id, full_name )
  ),
  attendance ( status, consumed )
` as const

const HISTORY_LIMIT = 60

export async function listStudentBookings(studentId: string) {
  const rows = unwrap(
    await supabase.from('bookings').select(BOOKING_SELECT).eq('student_id', studentId).order('created_at', { ascending: false }).limit(HISTORY_LIMIT),
  )
  // La fecha de la clase (no la de la reserva) es lo que importa al leer el historial.
  return rows.sort((a, b) => (b.session?.starts_at ?? '').localeCompare(a.session?.starts_at ?? ''))
}
export type StudentBooking = Awaited<ReturnType<typeof listStudentBookings>>[number]

export async function listProgressNotes(studentId: string) {
  return unwrap(
    await supabase
      .from('progress_notes')
      .select(
        `id, body, created_at,
         author:profiles!progress_notes_author_id_fkey ( full_name ),
         session:class_sessions ( starts_at, class_type:class_types ( name ) )`,
      )
      .eq('student_id', studentId)
      .order('created_at', { ascending: false }),
  )
}
export type ProgressNote = Awaited<ReturnType<typeof listProgressNotes>>[number]

export async function getAdminNotes(studentId: string): Promise<string> {
  const row = unwrapMaybe<{ notes: string | null }>(await supabase.from('student_admin_notes').select('notes').eq('profile_id', studentId).maybeSingle())
  return row?.notes ?? ''
}

export async function saveAdminNotes(studentId: string, notes: string): Promise<void> {
  const value = notes.trim() === '' ? null : notes.trim()
  unwrap(
    await supabase
      .from('student_admin_notes')
      .upsert({ profile_id: studentId, notes: value, updated_at: new Date().toISOString() })
      .select('profile_id')
      .single(),
  )
}
