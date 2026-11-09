import { Link } from '@tanstack/react-router'
import { CalendarDays } from 'lucide-react'
import { NotificationsBell } from '@/features/notifications/components/NotificationsBell'
import { academyNow, formatters } from '@/lib/dates'
import { Logo } from '../Logo'
import type { NavItem } from '../navigation'
import { FullMenu } from './FullMenu'

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Barra superior: logo y menú en móvil; fecha de hoy y avisos siempre a mano. */
export function TopBar({ items }: { items: NavItem[] }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line/80 bg-bg/80 px-4 backdrop-blur-xl sm:px-6 lg:px-10">
      <Link to="/" aria-label="Inicio" className="lg:hidden">
        <Logo />
      </Link>
      <p className="hidden items-center gap-2 text-sm text-fg-muted lg:flex">
        <CalendarDays className="size-4 text-rosa-hover" aria-hidden />
        {capitalize(formatters.fullDate(academyNow()))}
      </p>
      <div className="flex items-center gap-1">
        <NotificationsBell />
        <div className="lg:hidden">
          <FullMenu items={items} />
        </div>
      </div>
    </header>
  )
}
