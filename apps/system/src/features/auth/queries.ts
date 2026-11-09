import { queryOptions } from '@tanstack/react-query'
import { getProfile, getSession } from './api/auth.api'

export const authKeys = {
  session: ['auth', 'session'] as const,
  profile: (userId: string) => ['auth', 'profile', userId] as const,
}

export const sessionQuery = queryOptions({
  queryKey: authKeys.session,
  queryFn: getSession,
  staleTime: Infinity,
})

export const profileQuery = (userId: string) =>
  queryOptions({
    queryKey: authKeys.profile(userId),
    queryFn: () => getProfile(userId),
    staleTime: 60_000,
  })
