import { addMonths, endOfMonth, format } from 'date-fns'
import { academyToday, formatters, fromDateKey, toDateKey } from '@/lib/dates'

/** Un mes calendario se identifica como `yyyy-MM` (así viaja en la URL). */
export type MonthKey = string

export const MONTH_KEY_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/

export function currentMonthKey(): MonthKey {
  return format(academyToday(), 'yyyy-MM')
}

/** Primer día del mes como `yyyy-MM-dd`, el formato que esperan las RPC (`p_month`). */
export function monthStart(month: MonthKey): string {
  return `${month}-01`
}

export function monthEnd(month: MonthKey): string {
  return toDateKey(endOfMonth(fromDateKey(monthStart(month))))
}

export function shiftMonth(month: MonthKey, delta: number): MonthKey {
  return format(addMonths(fromDateKey(monthStart(month)), delta), 'yyyy-MM')
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Octubre 2026". */
export function monthLabel(month: MonthKey): string {
  return capitalize(formatters.monthYear(fromDateKey(monthStart(month))))
}

/** "octubre": para frases como "las clases de octubre". */
export function monthName(month: MonthKey): string {
  return formatters.monthYear(fromDateKey(monthStart(month))).split(' ')[0] ?? ''
}
