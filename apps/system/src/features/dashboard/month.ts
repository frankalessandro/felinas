import { endOfMonth, startOfMonth } from 'date-fns'
import { academyToday, toDateKey } from '@/lib/dates'

/** Mes calendario en curso (hora de la academia) como rango yyyy-MM-dd. */
export function getCurrentMonthRange(): { from: string; to: string } {
  const today = academyToday()
  return { from: toDateKey(startOfMonth(today)), to: toDateKey(endOfMonth(today)) }
}
