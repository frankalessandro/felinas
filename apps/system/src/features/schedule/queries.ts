import { queryOptions } from '@tanstack/react-query'
import { getSession, listSessions } from './api/sessions.api'
import type { SessionFilters } from './types'

export const sessionKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionKeys.all, 'list'] as const,
  list: (filters: SessionFilters) => [...sessionKeys.lists(), filters] as const,
  detail: (id: string) => [...sessionKeys.all, 'detail', id] as const,
}

export const sessionsQuery = (filters: SessionFilters) =>
  queryOptions({
    queryKey: sessionKeys.list(filters),
    queryFn: () => listSessions(filters),
  })

export const sessionQuery = (id: string) =>
  queryOptions({
    queryKey: sessionKeys.detail(id),
    queryFn: () => getSession(id),
  })
