import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCalendarRange, type CalendarViewMode } from '@/lib/dates'
import { sessionsQuery } from '../queries'
import type { SessionFilters } from '../types'

type CalendarFilters = Omit<SessionFilters, 'from' | 'to'>

/** Sesiones del mes o semana visible. Mantiene los datos anteriores mientras carga el nuevo periodo. */
export function useCalendarSessions(view: CalendarViewMode, date: Date, filters: CalendarFilters = {}) {
  return useQuery({
    ...sessionsQuery({ ...getCalendarRange(view, date), ...filters }),
    placeholderData: keepPreviousData,
  })
}
