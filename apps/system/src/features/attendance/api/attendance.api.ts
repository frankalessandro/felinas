import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { AttendanceStatus, RosterEntry, RosterPlan } from '../types'

const ROSTER_SELECT = `
  id, student_plan_id,
  student:profiles!bookings_student_id_fkey ( id, full_name, email, phone, avatar_url ),
  attendance ( status )
` as const

async function listPlanSummaries(studentPlanIds: string[]): Promise<Map<string, RosterPlan>> {
  if (studentPlanIds.length === 0) return new Map()
  const rows = unwrap(
    await supabase
      .from('student_plan_summary')
      .select('student_plan_id, plan_name, classes_remaining, is_expiring')
      .in('student_plan_id', studentPlanIds),
  )
  const plans = new Map<string, RosterPlan>()
  for (const row of rows) {
    if (!row.student_plan_id) continue
    plans.set(row.student_plan_id, {
      planName: row.plan_name ?? 'Plan',
      classesRemaining: row.classes_remaining,
      isExpiring: Boolean(row.is_expiring),
    })
  }
  return plans
}

/** Alumnas con reserva confirmada (`booked`) y su asistencia actual. La lista de espera no asiste. */
export async function listRoster(sessionId: string): Promise<RosterEntry[]> {
  const bookings = unwrap(await supabase.from('bookings').select(ROSTER_SELECT).eq('session_id', sessionId).eq('status', 'booked').order('created_at'))
  const planIds = bookings.flatMap((b) => (b.student_plan_id ? [b.student_plan_id] : []))
  const plans = await listPlanSummaries([...new Set(planIds)])

  return bookings
    .flatMap((booking) => (booking.student ? [{ booking, student: booking.student }] : []))
    .map(({ booking, student }) => ({
      bookingId: booking.id,
      student,
      status: booking.attendance?.status ?? null,
      plan: booking.student_plan_id ? (plans.get(booking.student_plan_id) ?? null) : null,
    }))
    .sort((a, b) => (a.student.full_name ?? '').localeCompare(b.student.full_name ?? '', 'es'))
}

export async function markAttendance(input: { bookingId: string; status: AttendanceStatus }) {
  return unwrap(await supabase.rpc('mark_attendance', { p_booking_id: input.bookingId, p_status: input.status }))
}
