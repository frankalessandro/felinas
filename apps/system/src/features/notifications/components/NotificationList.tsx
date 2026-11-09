import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'
import { CheckCheck } from 'lucide-react'
import { AsyncContent, Button, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '../hooks/useNotifications'
import { NOTIFICATION_DISPLAY } from '../notificationDisplay'
import type { AppNotification } from '../types'

function NotificationRow({ notification, onRead }: { notification: AppNotification; onRead: (id: string) => void }) {
  const { icon: Icon, tone } = NOTIFICATION_DISPLAY[notification.type]
  const isUnread = !notification.read_at

  return (
    <li>
      <button
        type="button"
        onClick={() => isUnread && onRead(notification.id)}
        aria-label={`${isUnread ? 'No leída: ' : ''}${notification.title}`}
        className={cn(
          'flex min-h-16 w-full items-start gap-3 rounded-2xl border p-3 text-left transition-colors',
          isUnread ? 'border-rosa/30 bg-rosa-soft hover:bg-rosa/15' : 'border-line bg-surface hover:bg-surface-2',
        )}
      >
        <span aria-hidden className={cn('grid size-10 shrink-0 place-items-center rounded-xl', tone)}>
          <Icon className="size-5" />
        </span>
        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="flex items-start justify-between gap-2">
            <span className="font-display text-sm font-bold leading-tight">{notification.title}</span>
            {isUnread && <span aria-hidden className="mt-1 size-2.5 shrink-0 rounded-full bg-rosa" />}
          </span>
          {notification.body && <span className="text-sm text-fg-muted">{notification.body}</span>}
          <span className="text-xs text-fg-subtle">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: es })}
          </span>
        </span>
      </button>
    </li>
  )
}

export function NotificationList() {
  const query = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()
  const notifications = query.data ?? []
  const hasUnread = notifications.some((n) => !n.read_at)

  return (
    <div className="flex flex-col gap-3">
      {hasUnread && (
        <Button variant="ghost" size="sm" className="self-end" onClick={() => markAll.mutate()}>
          <CheckCheck className="size-4" aria-hidden />
          Marcar todo como leído
        </Button>
      )}
      <AsyncContent
        isLoading={query.isPending}
        error={query.error}
        onRetry={() => void query.refetch()}
        isEmpty={notifications.length === 0}
        empty={
          <EmptyState
            illustration="bell"
            title="Sin avisos por ahora"
            description="Aquí verás cuando se libere un cupo, se cancele una clase o tu plan esté por vencer."
            className="py-8"
          />
        }
      >
        <ul className="flex flex-col gap-2">
          {notifications.map((notification) => (
            <NotificationRow key={notification.id} notification={notification} onRead={(id) => markRead.mutate(id)} />
          ))}
        </ul>
      </AsyncContent>
    </div>
  )
}
