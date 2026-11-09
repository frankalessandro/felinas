import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import { SESSION_DETAILS_SELECT } from '@/features/schedule/api/sessions.api'
import type { SessionWithDetails } from '@/features/schedule/types'
import type { TablesUpdate } from '@/types/database'
import type { SessionBooking, SessionFormOptions, SessionInsert, StudentPlanOption } from '../types'

const BOOKING_SELECT = `
  *,
  student:profiles!bookings_student_id_fkey ( id, full_name, email, phone, avatar_url )
` as const

/** Reservas activas de una sesión: primero las reservadas, luego la lista de espera en orden. */
export async function listSessionBookings(sessionId: string): Promise<SessionBooking[]> {
  const rows = unwrap(
    await supabase
      .from('bookings')
      .select(BOOKING_SELECT)
      .eq('session_id', sessionId)
      .in('status', ['booked', 'waitlist'])
      .order('waitlist_position', { nullsFirst: true })
      .order('created_at'),
  )
  return rows.sort((a, b) => Number(a.status === 'waitlist') - Number(b.status === 'waitlist'))
}

export async function listStudentPlans(studentId: string): Promise<StudentPlanOption[]> {
  const rows = unwrap(
    await supabase
      .from('student_plan_summary')
      .select('student_plan_id, plan_name, is_private, classes_remaining, expires_on')
      .eq('student_id', studentId)
      .eq('effective_status', 'active')
      .order('expires_on'),
  )
  return rows.flatMap((row) =>
    row.student_plan_id && row.plan_name && row.expires_on
      ? [
          {
            studentPlanId: row.student_plan_id,
            planName: row.plan_name,
            isPrivate: Boolean(row.is_private),
            classesRemaining: row.classes_remaining,
            expiresOn: row.expires_on,
          },
        ]
      : [],
  )
}

export async function getSessionFormOptions(): Promise<SessionFormOptions> {
  const [teachers, classTypes, rooms] = await Promise.all([
    supabase.from('teachers').select('id, full_name').eq('active', true).is('deleted_at', null).order('full_name'),
    supabase.from('class_types').select('id, name, color').eq('active', true).is('deleted_at', null).order('name'),
    supabase.from('rooms').select('id, name, capacity').eq('active', true).order('name'),
  ])
  return { teachers: unwrap(teachers), classTypes: unwrap(classTypes), rooms: unwrap(rooms) }
}

export async function addStudentToSession(input: { sessionId: string; studentId: string; studentPlanId?: string }) {
  return unwrap(
    await supabase.rpc('admin_add_student_to_session', {
      p_session_id: input.sessionId,
      p_student_id: input.studentId,
      p_student_plan_id: input.studentPlanId,
    }),
  )
}

export async function cancelBooking(bookingId: string) {
  return unwrap(await supabase.rpc('cancel_booking', { p_booking_id: bookingId }))
}

export async function cancelSession(input: { sessionId: string; reason: string }) {
  return unwrap(await supabase.rpc('cancel_session', { p_session_id: input.sessionId, p_reason: input.reason }))
}

export async function generateSessions(input: { from: string; weeks: number }): Promise<number> {
  const created = unwrap(await supabase.rpc('generate_sessions', { p_from: input.from, p_weeks: input.weeks }))
  return Number(created)
}

export async function createSession(input: SessionInsert): Promise<SessionWithDetails> {
  return unwrap(await supabase.from('class_sessions').insert(input).select(SESSION_DETAILS_SELECT).single())
}

export async function updateSession(id: string, patch: TablesUpdate<'class_sessions'>): Promise<SessionWithDetails> {
  return unwrap(await supabase.from('class_sessions').update(patch).eq('id', id).select(SESSION_DETAILS_SELECT).single())
}
