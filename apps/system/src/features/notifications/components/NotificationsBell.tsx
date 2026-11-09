import { useState } from 'react'
import { Bell } from 'lucide-react'
import { Dialog, Popover, PopoverContent, PopoverTrigger } from '@/components/ui'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'
import { useUnreadCount } from '../hooks/useNotifications'
import { NotificationList } from './NotificationList'

const DESKTOP_QUERY = '(min-width: 768px)'
const MAX_BADGE = 9

interface NotificationsBellProps {
  /** `sidebar` abre el panel a la derecha de la barra lateral; `header` debajo del botón. */
  placement?: 'header' | 'sidebar'
  className?: string
}

/** Campana con contador de no leídas: hoja inferior en móvil, popover desde tablet. */
export function NotificationsBell({ placement = 'header', className }: NotificationsBellProps) {
  const [open, setOpen] = useState(false)
  const isDesktop = useMediaQuery(DESKTOP_QUERY)
  const unread = useUnreadCount()

  const trigger = (
    <button
      type="button"
      aria-label={unread > 0 ? `Avisos, ${unread} sin leer` : 'Avisos'}
      onClick={isDesktop ? undefined : () => setOpen(true)}
      className={cn(
        'relative grid size-11 shrink-0 place-items-center rounded-xl text-fg-muted transition hover:bg-surface-2 hover:text-fg',
        className,
      )}
    >
      <Bell className="size-5" aria-hidden />
      {unread > 0 && (
        <span
          aria-hidden
          className="absolute right-1 top-1 grid min-w-[1.125rem] place-items-center rounded-full bg-rosa px-1 text-[10px] font-bold leading-[1.125rem] text-white"
        >
          {unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
        </span>
      )}
    </button>
  )

  if (!isDesktop) {
    return (
      <>
        {trigger}
        <Dialog open={open} onOpenChange={setOpen} title="Avisos">
          <NotificationList />
        </Dialog>
      </>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent side={placement === 'sidebar' ? 'right' : 'bottom'} align="end" className="max-h-[70dvh] w-96 overflow-y-auto">
        <h2 className="mb-3 font-display text-base font-bold">Avisos</h2>
        <NotificationList />
      </PopoverContent>
    </Popover>
  )
}
