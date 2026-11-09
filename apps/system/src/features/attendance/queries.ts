import { queryOptions } from '@tanstack/react-query'
import { listRoster } from './api/attendance.api'

export const attendanceKeys = {
  all: ['attendance'] as const,
  roster: (sessionId: string) => [...attendanceKeys.all, 'roster', sessionId] as const,
}

export const rosterQuery = (sessionId: string) =>
  queryOptions({
    queryKey: attendanceKeys.roster(sessionId),
    queryFn: () => listRoster(sessionId),
  })
