import { CalendarClock, DoorOpen, User, X } from 'lucide-react'
import { Stamp } from '@/components/brand'
import { IconButton } from '@/components/ui'
import { formatters } from '@/lib/dates'
import type { BookingWithSession } from '../types'

interface UpcomingBookingsListProps {
  bookings: BookingWithSession[]
  onCancel: (booking: BookingWithSession) => void
}

const FALLBACK_COLOR = '#ea1a62'

/** Fila de reserva: fecha a la izquierda, datos de la clase y acción de cancelar. */
function UpcomingRow({ booking, onCancel }: { booking: BookingWithSession; onCancel: (booking: BookingWithSession) => void }) {
  const { session } = booking
  const color = session.class_type?.color ?? FALLBACK_COLOR
  const title = session.title ?? session.class_type?.name ?? 'Clase'
  const isWaitlist = booking.status === 'waitlist'
  const isPrivate = session.kind === 'private'

  return (
    <li className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 pl-4">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex w-12 shrink-0 flex-col items-center rounded-xl bg-surface-2 py-1.5 leading-none">
        <span className="text-[11px] font-semibold capitalize text-fg-muted">{formatters.weekdayShort(session.starts_at)}</span>
        <span className="mt-1 font-display text-xl font-bold tabular-nums">{formatters.dayNumber(session.starts_at)}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-display text-sm font-bold">{title}</p>
          {isWaitlist && <Stamp tone="warn">{booking.waitlist_position ? `Espera #${booking.waitlist_position}` : 'En espera'}</Stamp>}
          {isPrivate && <Stamp tone="dorado">Personalizada</Stamp>}
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted">
          <span className="inline-flex items-center gap-1 font-semibold text-fg">
            <CalendarClock className="size-3" aria-hidden />
            {formatters.time(session.starts_at)}
          </span>
          {session.teacher && (
            <span className="inline-flex items-center gap-1">
              <User className="size-3" aria-hidden />
              {session.teacher.full_name}
            </span>
          )}
          {session.room && (
            <span className="inline-flex items-center gap-1">
              <DoorOpen className="size-3" aria-hidden />
              {session.room.name}
            </span>
          )}
        </p>
      </div>
      {!isPrivate && (
        <IconButton aria-label={`${isWaitlist ? 'Salir de la lista de espera de' : 'Cancelar reserva de'} ${title}`} onClick={() => onCancel(booking)}>
          <X className="size-5" aria-hidden />
        </IconButton>
      )}
    </li>
  )
}

export function UpcomingBookingsList({ bookings, onCancel }: UpcomingBookingsListProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {bookings.map((booking) => (
        <UpcomingRow key={booking.id} booking={booking} onCancel={onCancel} />
      ))}
    </ul>
  )
}
