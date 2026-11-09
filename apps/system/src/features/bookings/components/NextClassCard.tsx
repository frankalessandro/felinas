import { Clock, DoorOpen, TicketCheck, Timer, User, X } from 'lucide-react'
import { Stamp, Ticket } from '@/components/brand'
import { Button } from '@/components/ui'
import { formatters } from '@/lib/dates'
import { describeCountdown, describeSessionMoment } from '../time'
import type { BookingWithSession } from '../types'

interface NextClassCardProps {
  booking: BookingWithSession
  now: Date
  onCancel: (booking: BookingWithSession) => void
}

const FALLBACK_COLOR = '#ea1a62'
const IMMINENT_MINUTES = 60

/** "Tu próxima clase" como entrada: datos arriba y, en el talón, cuenta regresiva y cancelación. */
export function NextClassCard({ booking, now, onCancel }: NextClassCardProps) {
  const { session } = booking
  const color = session.class_type?.color ?? FALLBACK_COLOR
  const title = session.title ?? session.class_type?.name ?? 'Clase'
  const countdown = describeCountdown(session.starts_at, now)
  const isImminent = new Date(session.starts_at).getTime() - now.getTime() <= IMMINENT_MINUTES * 60_000
  const isPrivate = session.kind === 'private'

  return (
    <Ticket
      aria-label="Tu próxima clase"
      color={color}
      className="h-full"
      stub={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          {countdown ? (
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-fg">
              <Timer className="size-4 text-rosa-hover" aria-hidden />
              {isImminent && <span aria-hidden className="size-2 animate-pulse rounded-full bg-rosa motion-reduce:animate-none" />}
              {countdown}
            </span>
          ) : (
            <span className="text-xs text-fg-muted">{isPrivate ? 'Para cambiarla, coordina con la academia.' : 'Cancelar es gratis hasta que empiece.'}</span>
          )}
          {!isPrivate && (
            <Button variant="ghost" size="sm" className="min-h-11 text-fg-muted" onClick={() => onCancel(booking)}>
              <X className="size-4" aria-hidden />
              Cancelar reserva
            </Button>
          )}
        </div>
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="inline-flex items-center gap-2 text-sm font-semibold text-fg-muted">
          <TicketCheck className="size-4 text-rosa-hover" aria-hidden />
          Tu próxima clase
        </p>
        {isPrivate && <Stamp tone="dorado">Personalizada</Stamp>}
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl">{describeSessionMoment(session.starts_at, now)}</h2>
        <p className="inline-flex items-center gap-2 font-display text-base font-bold">
          <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
          {title}
        </p>
      </div>

      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-fg-muted">
        <li className="inline-flex items-center gap-1.5">
          <Clock className="size-4" aria-hidden />
          {formatters.timeRange(session.starts_at, session.ends_at)}
        </li>
        {session.teacher && (
          <li className="inline-flex items-center gap-1.5">
            <User className="size-4" aria-hidden />
            {session.teacher.full_name}
          </li>
        )}
        {session.room && (
          <li className="inline-flex items-center gap-1.5">
            <DoorOpen className="size-4" aria-hidden />
            {session.room.name}
          </li>
        )}
      </ul>
    </Ticket>
  )
}
