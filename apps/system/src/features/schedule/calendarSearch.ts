import { z } from 'zod'
import { academyToday, fromDateKey, type CalendarViewMode } from '@/lib/dates'

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/** Estado del calendario en la URL, compartido por las agendas de admin, profe y alumna. */
export const calendarSearchShape = {
  view: z.enum(['month', 'week']).optional().catch(undefined),
  date: dateKey.optional().catch(undefined),
}

export interface CalendarSearch {
  view?: CalendarViewMode
  date?: string
}

export const DEFAULT_CALENDAR_VIEW: CalendarViewMode = 'month'

export function resolveCalendarSearch(search: CalendarSearch): { view: CalendarViewMode; date: Date } {
  return {
    view: search.view ?? DEFAULT_CALENDAR_VIEW,
    date: search.date ? fromDateKey(search.date) : academyToday(),
  }
}
