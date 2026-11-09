import { BadgeCheck, CalendarPlus, CalendarX2, Hourglass, Info, PartyPopper, type LucideIcon } from 'lucide-react'
import type { NotificationType } from './types'

interface NotificationDisplay {
  icon: LucideIcon
  /** Clases de Tailwind para el icono y su fondo. */
  tone: string
}

export const NOTIFICATION_DISPLAY = {
  booking_promoted: { icon: PartyPopper, tone: 'bg-ok-soft text-ok' },
  session_cancelled: { icon: CalendarX2, tone: 'bg-danger-soft text-danger' },
  booking_added: { icon: CalendarPlus, tone: 'bg-rosa-soft text-rosa-hover' },
  plan_expiring: { icon: Hourglass, tone: 'bg-dorado-soft text-dorado' },
  account_approved: { icon: BadgeCheck, tone: 'bg-ok-soft text-ok' },
  general: { icon: Info, tone: 'bg-surface-3 text-fg-muted' },
} as const satisfies Record<NotificationType, NotificationDisplay>
