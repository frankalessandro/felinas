import { addDays } from 'date-fns'
import { getBusinessWeekStart, toAcademyTime, toDateKey } from '@/lib/dates'
import type { BookingWithSession } from './types'

export interface MonthGroup {
  /** `yyyy-MM` */
  key: string
  /** Fecha cualquiera del mes, para formatear el título. */
  sample: string
  items: BookingWithSession[]
}

export interface HistoryStats {
  attendedThisMonth: number
  weeklyStreak: number
  favoriteStyle: string | null
}

export function isAttended(booking: BookingWithSession): boolean {
  return booking.attendance?.status === 'present'
}

function monthKey(iso: string): string {
  return toDateKey(iso).slice(0, 7)
}

/** Agrupa por mes de la academia respetando el orden recibido (ya viene del más reciente al más antiguo). */
export function groupByMonth(bookings: BookingWithSession[]): MonthGroup[] {
  const groups = new Map<string, MonthGroup>()
  for (const booking of bookings) {
    const key = monthKey(booking.session.starts_at)
    const group = groups.get(key) ?? { key, sample: booking.session.starts_at, items: [] }
    group.items.push(booking)
    groups.set(key, group)
  }
  return [...groups.values()]
}

/** Semanas seguidas con al menos una clase asistida. La semana en curso no rompe la racha si aún no asiste. */
export function getWeeklyStreak(attended: BookingWithSession[], now: Date): number {
  const weeks = new Set(attended.map((b) => toDateKey(getBusinessWeekStart(new Date(b.session.starts_at)))))
  let cursor = getBusinessWeekStart(now)
  if (!weeks.has(toDateKey(cursor))) cursor = getBusinessWeekStart(addDays(cursor, -7))

  let streak = 0
  while (weeks.has(toDateKey(cursor))) {
    streak += 1
    cursor = getBusinessWeekStart(addDays(cursor, -7))
  }
  return streak
}

export function getFavoriteStyle(attended: BookingWithSession[]): string | null {
  const counts = new Map<string, number>()
  for (const booking of attended) {
    const name = booking.session.class_type?.name
    if (name) counts.set(name, (counts.get(name) ?? 0) + 1)
  }
  let best: string | null = null
  let bestCount = 0
  for (const [name, count] of counts) {
    if (count > bestCount) {
      best = name
      bestCount = count
    }
  }
  return best
}

export function getHistoryStats(bookings: BookingWithSession[], now: Date): HistoryStats {
  const attended = bookings.filter(isAttended)
  const currentMonth = toDateKey(toAcademyTime(now)).slice(0, 7)
  return {
    attendedThisMonth: attended.filter((b) => monthKey(b.session.starts_at) === currentMonth).length,
    weeklyStreak: getWeeklyStreak(attended, now),
    favoriteStyle: getFavoriteStyle(attended),
  }
}
