import { addDays } from 'date-fns'
import { academyToday, fromDateKey, toDateKey } from '@/lib/dates'

export function getTodayKey(): string {
  return toDateKey(academyToday())
}

/** Rango [inicio, fin) del día en ISO UTC para filtrar `starts_at`. */
export function getDayRange(dayKey: string): { from: string; to: string } {
  const start = fromDateKey(dayKey)
  return { from: start.toISOString(), to: addDays(start, 1).toISOString() }
}
