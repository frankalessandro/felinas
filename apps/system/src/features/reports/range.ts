import { subDays } from 'date-fns'
import { academyToday, toDateKey } from '@/lib/dates'
import type { DateRange } from './types'

const DEFAULT_RANGE_DAYS = 30

/** Últimos 30 días hasta hoy (hora de la academia). */
export function getDefaultRange(): DateRange {
  const today = academyToday()
  return { from: toDateKey(subDays(today, DEFAULT_RANGE_DAYS)), to: toDateKey(today) }
}
