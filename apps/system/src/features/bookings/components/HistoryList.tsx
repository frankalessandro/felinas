import { DoorOpen, User } from 'lucide-react'
import { Stamp } from '@/components/brand'
import { formatters } from '@/lib/dates'
import { isAttended, type MonthGroup } from '../history'
import type { BookingWithSession } from '../types'
import { AttendanceBadge } from './AttendanceBadge'

const FALLBACK_COLOR = '#ea1a62'

function HistoryRow({ booking }: { booking: BookingWithSession }) {
  const { session } = booking
  const title = session.title ?? session.class_type?.name ?? 'Clase'
  return (
    <li className="relative flex items-center gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-3 pl-4">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: session.class_type?.color ?? FALLBACK_COLOR }} />
      <div className="flex w-11 shrink-0 flex-col items-center leading-none">
        <span className="text-[11px] font-semibold capitalize text-fg-muted">{formatters.weekdayShort(session.starts_at)}</span>
        <span className="mt-1 font-display text-xl font-bold tabular-nums">{formatters.dayNumber(session.starts_at)}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="font-display text-sm font-bold">{title}</p>
          {session.kind === 'private' && <Stamp tone="dorado">Personalizada</Stamp>}
        </div>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted">
          <span className="font-semibold text-fg">{formatters.time(session.starts_at)}</span>
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
      <AttendanceBadge attendance={booking.attendance} />
    </li>
  )
}

/** Clases agrupadas por mes, con el conteo de asistencias en el encabezado. */
export function HistoryList({ groups }: { groups: MonthGroup[] }) {
  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const attended = group.items.filter(isAttended).length
        const monthName = formatters.monthYear(group.sample)
        return (
          <section key={group.key} aria-label={monthName} className="flex flex-col gap-3">
            <h3 className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 font-display">
              <span className="text-lg font-bold first-letter:uppercase">{monthName}</span>
              <span className="text-xs font-medium text-fg-muted">
                {attended} {attended === 1 ? 'asistencia' : 'asistencias'}
              </span>
            </h3>
            <ul className="flex flex-col gap-2">
              {group.items.map((booking) => (
                <HistoryRow key={booking.id} booking={booking} />
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
