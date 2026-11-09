import { isSameAcademyDay } from '@/lib/dates'
import type { SessionWithDetails } from '@/features/schedule/types'
import type { RosterEntry, StudentBookingRow, TeacherStudent } from './types'

export const STUDENTS_WINDOW_DAYS = 60
export const NOTE_MAX_LENGTH = 1000

export interface WeekStats {
  classes: number
  bookedStudents: number
  /** 0–100; 0 si no hay cupos. */
  occupancyPct: number
}

export function computeWeekStats(sessions: SessionWithDetails[]): WeekStats {
  const active = sessions.filter((s) => s.status === 'scheduled')
  const booked = active.reduce((sum, s) => sum + s.booked_count, 0)
  const capacity = active.reduce((sum, s) => sum + s.capacity, 0)
  return {
    classes: active.length,
    bookedStudents: booked,
    occupancyPct: capacity === 0 ? 0 : Math.round((booked / capacity) * 100),
  }
}

export function getTodaySessions(sessions: SessionWithDetails[]): SessionWithDetails[] {
  return sessions.filter((s) => isSameAcademyDay(s.starts_at, new Date()))
}

/** La próxima clase que no ha terminado ni está cancelada (puede estar en curso). */
export function findNextSession(sessions: SessionWithDetails[], now: Date = new Date()): SessionWithDetails | undefined {
  return sessions.find((s) => s.status === 'scheduled' && new Date(s.ends_at) > now)
}

export function splitRoster(roster: RosterEntry[]): { booked: RosterEntry[]; waitlist: RosterEntry[] } {
  const booked = roster.filter((r) => r.status === 'booked')
  const waitlist = roster
    .filter((r) => r.status === 'waitlist')
    .sort((a, b) => (a.waitlist_position ?? Number.MAX_SAFE_INTEGER) - (b.waitlist_position ?? Number.MAX_SAFE_INTEGER))
  return { booked, waitlist }
}

export function groupStudents(rows: StudentBookingRow[]): TeacherStudent[] {
  const byId = new Map<string, TeacherStudent>()
  for (const { student, session } of rows) {
    if (!student) continue
    const current = byId.get(student.id)
    byId.set(student.id, {
      student,
      classesBooked: (current?.classesBooked ?? 0) + 1,
      lastClassAt: current && current.lastClassAt > session.starts_at ? current.lastClassAt : session.starts_at,
    })
  }
  return [...byId.values()].sort((a, b) => getStudentName(a.student).localeCompare(getStudentName(b.student), 'es'))
}

export function getStudentName(student: { full_name: string | null } | null): string {
  return student?.full_name?.trim() || 'Alumna sin nombre'
}

