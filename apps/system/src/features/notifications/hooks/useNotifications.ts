import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { getErrorMessage } from '@/lib/errors'
import { markAllNotificationsRead, markNotificationRead } from '../api/notifications.api'
import { notificationKeys, notificationsQuery, unreadCountQuery } from '../queries'
import type { AppNotification } from '../types'

export function useNotifications() {
  const profile = useCurrentProfile()
  return useQuery(notificationsQuery(profile.id))
}

export function useUnreadCount(): number {
  const profile = useCurrentProfile()
  return useQuery(unreadCountQuery(profile.id)).data ?? 0
}

function useMarkReadMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<void>,
  applyToList: (list: AppNotification[], variables: TVariables, readAt: string) => AppNotification[],
  unreadDelta: (list: AppNotification[], variables: TVariables) => number,
) {
  const queryClient = useQueryClient()
  const profile = useCurrentProfile()

  return useMutation({
    mutationFn,
    // Se marca al instante en pantalla; el refetch de `onSettled` deja el estado real del servidor.
    onMutate: async (variables: TVariables) => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.all })
      const list = queryClient.getQueryData<AppNotification[]>(notificationKeys.list(profile.id)) ?? []
      const delta = unreadDelta(list, variables)
      const readAt = new Date().toISOString()
      queryClient.setQueryData<AppNotification[]>(notificationKeys.list(profile.id), (current) =>
        current ? applyToList(current, variables, readAt) : current,
      )
      queryClient.setQueryData<number>(notificationKeys.unread(profile.id), (count) => Math.max((count ?? 0) - delta, 0))
    },
    onError: (error) => sileo.error({ title: 'No pudimos actualizar tus avisos', description: getErrorMessage(error) }),
    onSettled: () => queryClient.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkNotificationRead() {
  return useMarkReadMutation<string>(
    markNotificationRead,
    (list, id, readAt) => list.map((n) => (n.id === id && !n.read_at ? { ...n, read_at: readAt } : n)),
    (list, id) => (list.some((n) => n.id === id && !n.read_at) ? 1 : 0),
  )
}

export function useMarkAllNotificationsRead() {
  const profile = useCurrentProfile()
  return useMarkReadMutation<void>(
    () => markAllNotificationsRead(profile.id),
    (list, _variables, readAt) => list.map((n) => (n.read_at ? n : { ...n, read_at: readAt })),
    (list) => list.filter((n) => !n.read_at).length,
  )
}
