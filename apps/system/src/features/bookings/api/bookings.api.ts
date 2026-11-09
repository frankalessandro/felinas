import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import { SESSION_DETAILS_SELECT } from '@/features/schedule/api/sessions.api'
import type { Tables } from '@/types/database'
import type { BookingFilters, BookingWithSession, ClassTypeOption } from '../types'

// El alias `session:` rompería el filtro sobre la relación, por eso se mapea después.
const BOOKING_SELECT = `
  *,
  class_sessions!inner ( ${SESSION_DETAILS_SELECT} ),
  attendance ( status, consumed, marked_at )
` as const

/** Reservas de una alumna con su sesión. Genérico: sirve a la alumna y, más adelante, a otros roles. */
export async function listBookings(filters: BookingFilters): Promise<BookingWithSession[]> {
  let query = supabase.from('bookings').select(BOOKING_SELECT).eq('student_id', filters.studentId)

  if (filters.statuses) query = query.in('status', filters.statuses)
  if (filters.from) query = query.gte('class_sessions.starts_at', filters.from)
  if (filters.to) query = query.lt('class_sessions.starts_at', filters.to)
  // No se puede ordenar por la fecha de la sesión desde el servidor: `created_at` acota el límite y luego se reordena.
  if (filters.limit) query = query.order('created_at', { ascending: false }).limit(filters.limit)

  const rows = unwrap(await query)
  const bookings = rows.map(({ class_sessions, ...booking }): BookingWithSession => ({ ...booking, session: class_sessions }))

  const direction = filters.order === 'desc' ? -1 : 1
  return bookings.sort((a, b) => direction * a.session.starts_at.localeCompare(b.session.starts_at))
}

/** La base decide si queda `booked` o `waitlist` (y la posición). */
export async function bookSession(sessionId: string): Promise<Tables<'bookings'>> {
  return unwrap(await supabase.rpc('book_session', { p_session_id: sessionId }))
}

export async function cancelBooking(bookingId: string): Promise<Tables<'bookings'>> {
  return unwrap(await supabase.rpc('cancel_booking', { p_booking_id: bookingId }))
}

export async function listClassTypes(): Promise<ClassTypeOption[]> {
  return unwrap(await supabase.from('class_types').select('id, name, color, level').is('deleted_at', null).eq('active', true).order('name'))
}
