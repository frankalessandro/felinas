import type { ReactNode } from 'react'
import { differenceInMinutes, format } from 'date-fns'
import { DoorOpen, User } from 'lucide-react'
import { cn } from '@/lib/cn'
import { toAcademyTime } from '@/lib/dates'
import { EventStatus } from './EventStatus'
import { describeEvent } from './lib'
import { SeatPips } from './SeatPips'
import type { CalendarEvent } from './types'

interface EventCardProps {
  event: CalendarEvent
  onClick?: (event: CalendarEvent) => void
  /** Zona derecha de la tarjeta, ej. un botón "Reservar". Vive fuera del botón principal para no anidar controles. */
  action?: ReactNode
  className?: string
}

function TimeColumn({ event }: { event: CalendarEvent }) {
  const start = toAcademyTime(event.startsAt)
  const minutes = differenceInMinutes(new Date(event.endsAt), new Date(event.startsAt))
  return (
    <div className="flex w-14 shrink-0 flex-col items-start leading-none">
      <span className="font-display text-xl font-bold tabular-nums tracking-tight">{format(start, 'h:mm')}</span>
      <span className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-fg-muted">{start.getHours() >= 12 ? 'PM' : 'AM'}</span>
      <span className="mt-1.5 text-[10px] tabular-nums text-fg-subtle">{minutes} min</span>
    </div>
  )
}

function StatusLine({ event }: { event: CalendarEvent }) {
  if (event.status === 'cancelled') return <EventStatus label="Cancelada" tone="danger" />
  if (event.badge) return <EventStatus label={event.badge.label} tone={event.badge.tone} locked={event.disabled} />
  if (event.kind === 'private') return <EventStatus label="Personalizada" tone="dorado" />
  return null
}

/** Clase como tarjeta editorial: hora grande a la izquierda, cupos como puntos y estado en texto (sin píldoras). */
export function EventCard({ event, onClick, action, className }: EventCardProps) {
  const cancelled = event.status === 'cancelled'
  const full = event.booked >= event.capacity

  const main = (
    <>
      <div className="flex min-w-0 flex-col gap-1">
        <StatusLine event={event} />
        <h4 className={cn('truncate font-display text-base font-bold leading-tight', cancelled && 'line-through')}>{event.title}</h4>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted">
          {event.teacherName && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3.5" aria-hidden />
              {event.teacherName}
            </span>
          )}
          {event.roomName && (
            <span className="inline-flex items-center gap-1">
              <DoorOpen className="size-3.5" aria-hidden />
              {event.roomName}
            </span>
          )}
        </p>
      </div>
      {!cancelled && (
        <div className="flex items-center gap-3">
          <SeatPips booked={event.booked} capacity={event.capacity} color={event.color} />
          {full && event.waitlist ? <span className="text-[11px] text-fg-muted">{event.waitlist} en espera</span> : null}
        </div>
      )}
    </>
  )

  return (
    <div
      style={{ ['--chip' as string]: event.color }}
      className={cn(
        'group relative flex items-stretch gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 shadow-card transition',
        'bg-[linear-gradient(100deg,color-mix(in_srgb,var(--chip)_9%,transparent),transparent_45%)]',
        'hover:border-[color-mix(in_srgb,var(--chip)_45%,var(--color-line))]',
        (cancelled || event.disabled) && 'opacity-60',
        className,
      )}
    >
      <TimeColumn event={event} />
      <span aria-hidden className="w-0.5 shrink-0 self-stretch rounded-full" style={{ background: event.color }} />
      {onClick ? (
        <button
          type="button"
          aria-label={describeEvent(event)}
          onClick={() => onClick(event)}
          className="flex min-h-11 min-w-0 flex-1 flex-col justify-between gap-2 rounded-lg text-left active:scale-[.99]"
        >
          {main}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">{main}</div>
      )}
      {action && <div className="flex shrink-0 items-center">{action}</div>}
    </div>
  )
}
