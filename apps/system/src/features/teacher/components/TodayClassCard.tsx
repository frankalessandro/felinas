import { Link } from '@tanstack/react-router'
import { ArrowUpRight, Clock, DoorOpen } from 'lucide-react'
import { Meter } from '@/components/brand'
import { Badge, getCapacityTone } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { cn } from '@/lib/cn'
import { formatters, toDateKey } from '@/lib/dates'

const FALLBACK_COLOR = '#ea1a62'

interface TodayClassCardProps {
  session: SessionWithDetails
  isNext: boolean
  isPast: boolean
}

/** Clase de hoy: la siguiente lleva un halo del color del estilo; las demás, tarjetas compactas. */
export function TodayClassCard({ session, isNext, isPast }: TodayClassCardProps) {
  const cancelled = session.status === 'cancelled'
  const color = session.class_type?.color ?? FALLBACK_COLOR
  const title = session.title ?? session.class_type?.name ?? 'Clase'

  return (
    <Link
      to="/teacher/agenda"
      search={{ view: 'week', date: toDateKey(session.starts_at), session: session.id }}
      className={cn(
        'group relative flex min-h-11 items-center gap-4 overflow-hidden rounded-2xl border bg-surface p-4 pl-6 shadow-card transition active:scale-[.99]',
        isNext ? 'border-rosa/60 shadow-glow' : 'border-line hover:border-line-strong',
        (isPast || cancelled) && 'opacity-60',
      )}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: color }} />
      {isNext && (
        <span aria-hidden className="pointer-events-none absolute -right-14 -top-14 size-48 rounded-full opacity-25 blur-3xl" style={{ backgroundColor: color }} />
      )}
      <div className="relative flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 font-display text-lg font-bold tabular-nums">
            <Clock className="size-4 text-fg-subtle" aria-hidden />
            {formatters.time(session.starts_at)}
            <span className="text-xs font-medium text-fg-muted">– {formatters.time(session.ends_at)}</span>
          </span>
          {isNext && <Badge tone="rosa">Siguiente</Badge>}
          {cancelled && <Badge tone="danger">Cancelada</Badge>}
          {session.kind === 'private' && <Badge tone="dorado">Personalizada</Badge>}
        </div>
        <h3 className={cn('font-display font-bold leading-tight', isNext ? 'text-xl' : 'text-base')}>{title}</h3>
        <p className="flex flex-wrap items-center gap-x-3 text-sm text-fg-muted">
          {session.room && (
            <span className="inline-flex items-center gap-1.5">
              <DoorOpen className="size-4" aria-hidden />
              {session.room.name}
            </span>
          )}
          {!cancelled && (
            <span>
              {session.booked_count} reservadas · {session.waitlist_count} en espera
            </span>
          )}
        </p>
      </div>
      {!cancelled && (
        <Meter
          value={session.booked_count}
          max={session.capacity}
          tone={getCapacityTone(session.booked_count, session.capacity)}
          label={`${session.booked_count} de ${session.capacity} cupos`}
          size={56}
          className="relative"
        >
          <span className="font-display text-xs font-bold tabular-nums">
            {session.booked_count}/{session.capacity}
          </span>
        </Meter>
      )}
      <ArrowUpRight className="relative size-5 shrink-0 text-fg-subtle transition group-hover:text-rosa-hover" aria-hidden />
    </Link>
  )
}
