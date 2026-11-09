import { useQuery } from '@tanstack/react-query'
import { getWeekRange } from '@/lib/dates'
import { sessionsQuery } from '../queries'
import type { SessionFilters } from '../types'

type WeekFilters = Omit<SessionFilters, 'from' | 'to'>

export function useWeekSessions(weekStart: Date, filters: WeekFilters = {}) {
  return useQuery(sessionsQuery({ ...getWeekRange(weekStart), ...filters }))
}
