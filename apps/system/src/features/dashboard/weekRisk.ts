import type { SessionWithDetails } from '@/features/schedule/types'

/** Una clase grupal programada que aún no empieza y no llega al mínimo de reservas para dictarse. */
export function isAtRisk(session: SessionWithDetails, now: number): boolean {
  if (session.kind !== 'group' || session.status !== 'scheduled') return false
  if (now >= new Date(session.starts_at).getTime()) return false
  return session.booked_count < session.min_bookings
}

export function missingBookings(session: SessionWithDetails): number {
  return Math.max(session.min_bookings - session.booked_count, 0)
}

export function countAtRisk(sessions: SessionWithDetails[], now: number): number {
  return sessions.filter((session) => isAtRisk(session, now)).length
}
