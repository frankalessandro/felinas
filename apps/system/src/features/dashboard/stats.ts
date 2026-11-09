import type { SessionWithDetails } from '@/features/schedule/types'

const PERCENT = 100

function activeGroupSessions(sessions: SessionWithDetails[]): SessionWithDetails[] {
  return sessions.filter((s) => s.status === 'scheduled' && s.kind === 'group')
}

export function countScheduled(sessions: SessionWithDetails[]): number {
  return sessions.filter((s) => s.status === 'scheduled').length
}

export function countBookings(sessions: SessionWithDetails[]): number {
  return sessions.filter((s) => s.status === 'scheduled').reduce((sum, s) => sum + s.booked_count, 0)
}

/** Reservas sobre cupos de las clases grupales de la semana (entero 0–100). */
export function getWeekOccupancyPct(sessions: SessionWithDetails[]): number {
  const group = activeGroupSessions(sessions)
  const capacity = group.reduce((sum, s) => sum + s.capacity, 0)
  if (capacity === 0) return 0
  const booked = group.reduce((sum, s) => sum + s.booked_count, 0)
  return Math.round((booked / capacity) * PERCENT)
}
