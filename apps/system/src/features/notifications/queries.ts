import { queryOptions } from '@tanstack/react-query'
import { countUnreadNotifications, listNotifications } from './api/notifications.api'

/** Sin Realtime: se refresca cada minuto (y al volver a la pestaña, por defecto del QueryClient). */
const REFRESH_MS = 60_000

export const notificationKeys = {
  all: ['notifications'] as const,
  list: (profileId: string) => [...notificationKeys.all, 'list', profileId] as const,
  unread: (profileId: string) => [...notificationKeys.all, 'unread', profileId] as const,
}

export const notificationsQuery = (profileId: string) =>
  queryOptions({
    queryKey: notificationKeys.list(profileId),
    queryFn: () => listNotifications(profileId),
    refetchInterval: REFRESH_MS,
  })

export const unreadCountQuery = (profileId: string) =>
  queryOptions({
    queryKey: notificationKeys.unread(profileId),
    queryFn: () => countUnreadNotifications(profileId),
    refetchInterval: REFRESH_MS,
  })
