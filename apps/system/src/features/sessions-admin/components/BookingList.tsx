import { Hourglass, Users, X } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Avatar, Badge, EmptyState, IconButton } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import type { SessionBooking } from '../types'

interface BookingRowProps {
  booking: SessionBooking
  canCancel: boolean
  onCancel: (booking: SessionBooking) => void
}

function studentName(booking: SessionBooking): string {
  return booking.student?.full_name ?? booking.student?.email ?? 'Alumna'
}

function BookingRow({ booking, canCancel, onCancel }: BookingRowProps) {
  const name = studentName(booking)
  return (
    <li className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 p-2.5 pr-2">
      <Avatar name={name} src={booking.student?.avatar_url} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-bold">{name}</p>
        {booking.status === 'waitlist' && <Badge tone="warn">Espera #{booking.waitlist_position}</Badge>}
      </div>
      <WhatsAppButton phone={booking.student?.phone} name={name} size="icon" />
      {canCancel && (
        <IconButton aria-label={`Cancelar reserva de ${name}`} onClick={() => onCancel(booking)}>
          <X className="size-5" aria-hidden />
        </IconButton>
      )}
    </li>
  )
}

interface BookingListProps {
  bookings: SessionBooking[]
  canCancel: boolean
  onCancel: (booking: SessionBooking) => void
}

function SectionTitle({ label, count, tone }: { label: string; count: number; tone: 'rosa' | 'warn' }) {
  return (
    <h3 className="mb-2 flex items-center gap-2 font-display text-sm font-bold">
      <IconTile icon={tone === 'warn' ? Hourglass : Users} tone={tone} size="sm" />
      {label}
      <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs font-semibold tabular-nums text-fg-muted">{count}</span>
    </h3>
  )
}

export function BookingList({ bookings, canCancel, onCancel }: BookingListProps) {
  if (bookings.length === 0) {
    return <EmptyState illustration="people" title="Aún no hay reservas" description="Agrega alumnas con el botón de arriba." className="py-8" />
  }
  const booked = bookings.filter((b) => b.status === 'booked')
  const waitlist = bookings.filter((b) => b.status === 'waitlist')

  return (
    <div className="flex flex-col gap-5">
      {booked.length > 0 && (
        <section aria-label="Reservadas">
          <SectionTitle label="Reservadas" count={booked.length} tone="rosa" />
          <ul className="flex flex-col gap-2">
            {booked.map((booking) => (
              <BookingRow key={booking.id} booking={booking} canCancel={canCancel} onCancel={onCancel} />
            ))}
          </ul>
        </section>
      )}
      {waitlist.length > 0 && (
        <section aria-label="Lista de espera">
          <SectionTitle label="Lista de espera" count={waitlist.length} tone="warn" />
          <ul className="flex flex-col gap-2">
            {waitlist.map((booking) => (
              <BookingRow key={booking.id} booking={booking} canCancel={canCancel} onCancel={onCancel} />
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
