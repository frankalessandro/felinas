import { useQuery } from '@tanstack/react-query'
import { AsyncContent, Badge, EmptyState } from '@/components/ui'
import type { BadgeTone } from '@/components/ui'
import { formatters } from '@/lib/dates'
import type { Enums } from '@/types/database'
import type { StudentBooking } from '../api/studentHistory.api'
import { studentBookingsQuery } from '../queries'

interface Outcome {
  label: string
  tone: BadgeTone
}

const ATTENDANCE_OUTCOME: Record<Enums<'attendance_status'>, Outcome> = {
  present: { label: 'Asistió', tone: 'ok' },
  absent: { label: 'Faltó', tone: 'danger' },
  excused: { label: 'Justificada', tone: 'neutral' },
}

function getOutcome(booking: StudentBooking): Outcome {
  if (booking.status === 'cancelled') return { label: 'Reserva cancelada', tone: 'neutral' }
  if (booking.session?.status === 'cancelled') return { label: 'Clase cancelada', tone: 'warn' }
  if (booking.attendance) return ATTENDANCE_OUTCOME[booking.attendance.status]
  if (booking.status === 'waitlist') return { label: 'Lista de espera', tone: 'warn' }
  return { label: 'Reservada', tone: 'rosa' }
}

function BookingRow({ booking }: { booking: StudentBooking }) {
  const session = booking.session
  const outcome = getOutcome(booking)
  if (!session) return null
  return (
    <li className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ backgroundColor: session.class_type?.color ?? '#8a7a90' }} />
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate font-display text-sm font-bold">
          {session.title ?? session.class_type?.name ?? 'Clase'}
        </span>
        <span className="text-xs capitalize text-fg-muted">
          {formatters.fullDate(session.starts_at)} · {formatters.time(session.starts_at)}
        </span>
        {session.teacher && <span className="text-xs text-fg-subtle">Con {session.teacher.full_name}</span>}
      </div>
      <Badge tone={outcome.tone}>{outcome.label}</Badge>
    </li>
  )
}

export function StudentHistoryTab({ studentId }: { studentId: string }) {
  const query = useQuery(studentBookingsQuery(studentId))
  return (
    <AsyncContent
      isLoading={query.isLoading}
      error={query.error}
      isEmpty={query.data?.length === 0}
      onRetry={() => query.refetch()}
      empty={<EmptyState illustration="calendar" title="Sin reservas todavía" description="Cuando reserve clases, su historial y asistencia aparecerán aquí." />}
    >
      <ul className="flex flex-col gap-2">
        {query.data?.map((booking) => (
          <BookingRow key={booking.id} booking={booking} />
        ))}
      </ul>
    </AsyncContent>
  )
}
