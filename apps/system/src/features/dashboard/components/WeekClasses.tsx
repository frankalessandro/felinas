import { Link } from '@tanstack/react-router'
import { CalendarRange, ClipboardCheck, MapPin, UserRound, XCircle } from 'lucide-react'
import { useState } from 'react'
import { EventStatus, SeatPips } from '@/components/calendar'
import { IconTile } from '@/components/brand'
import { AsyncContent, Button, buttonVariants, EmptyState, Skeleton } from '@/components/ui'
import { getTodayKey } from '@/features/attendance/day'
import type { SessionWithDetails } from '@/features/schedule/types'
import { CancelSessionDialog } from '@/features/sessions-admin/components/CancelSessionDialog'
import { cn } from '@/lib/cn'
import { formatters, toDateKey } from '@/lib/dates'
import { countAtRisk, isAtRisk, missingBookings } from '../weekRisk'

interface WeekClassesProps {
  sessions: SessionWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

function groupByDay(sessions: SessionWithDetails[]): [string, SessionWithDetails[]][] {
  const groups = new Map<string, SessionWithDetails[]>()
  for (const session of sessions) {
    const key = toDateKey(session.starts_at)
    groups.set(key, [...(groups.get(key) ?? []), session])
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b))
}

interface SessionRowProps {
  session: SessionWithDetails
  now: number
  isToday: boolean
  onCancel: (session: SessionWithDetails) => void
}

function SessionRow({ session, now, isToday, onCancel }: SessionRowProps) {
  const cancelled = session.status === 'cancelled'
  const done = !cancelled && now >= new Date(session.ends_at).getTime()
  const atRisk = isAtRisk(session, now)
  const missing = missingBookings(session)
  const color = session.class_type?.color ?? 'var(--color-rosa)'
  const title = session.title ?? session.class_type?.name ?? 'Clase'

  return (
    <li
      style={{ ['--chip' as string]: color }}
      className={cn(
        'relative grid grid-cols-[3.75rem_1fr] gap-3 overflow-hidden rounded-xl border bg-surface-2/60 p-3 pl-4 sm:grid-cols-[4.5rem_1fr]',
        atRisk ? 'border-warn/50 bg-warn-soft/40' : 'border-line',
        (cancelled || done) && 'opacity-60',
      )}
    >
      <span aria-hidden className="absolute inset-y-2 left-1.5 w-1 rounded-full" style={{ background: atRisk ? 'var(--color-warn)' : color }} />
      <div className="flex flex-col items-end pt-0.5 text-right">
        <p className="font-display text-base font-bold leading-none tabular-nums">{formatters.time(session.starts_at)}</p>
        <p className="mt-1 text-xs tabular-nums text-fg-subtle">{formatters.time(session.ends_at)}</p>
      </div>
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1 basis-44">
          {cancelled && <EventStatus label="Cancelada" tone="danger" className="mb-1" />}
          {done && <EventStatus label="Terminada" tone="neutral" className="mb-1" />}
          {session.kind === 'private' && !cancelled && <EventStatus label="Personalizada" tone="dorado" className="mb-1" />}
          {atRisk && (
            <EventStatus label={missing === 1 ? 'Falta 1 reserva para el mínimo' : `Faltan ${missing} reservas para el mínimo`} tone="warn" className="mb-1" />
          )}
          <p className="truncate font-display text-base font-bold leading-tight">{title}</p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted">
            <span className="inline-flex items-center gap-1">
              <UserRound className="size-3.5" aria-hidden />
              {session.teacher?.full_name ?? 'Sin profe'}
            </span>
            {session.room && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" aria-hidden />
                {session.room.name}
              </span>
            )}
          </p>
        </div>
        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto">
          <div className="flex min-w-24 flex-1 flex-col gap-1 sm:flex-none">
            <SeatPips booked={session.booked_count} capacity={session.capacity} color={color} />
            {session.kind === 'group' && !cancelled && (
              <p className="text-[11px] text-fg-subtle">
                Mínimo <span className="font-semibold tabular-nums">{session.min_bookings}</span>
              </p>
            )}
          </div>
          {atRisk && (
            <Button variant="danger" size="sm" className="min-h-11" onClick={() => onCancel(session)}>
              <XCircle className="size-4" aria-hidden />
              Cancelar
            </Button>
          )}
          {isToday && !cancelled && !atRisk && (
            <Link
              to="/admin/attendance"
              search={{ session: session.id }}
              className={buttonVariants({ variant: 'secondary', size: 'sm', className: 'min-h-11' })}
            >
              <ClipboardCheck className="size-4" aria-hidden />
              Pasar lista
            </Link>
          )}
        </div>
      </div>
    </li>
  )
}

/** Clases de la semana, con las que no llegan al mínimo de reservas resaltadas y un botón para cancelarlas. */
export function WeekClasses({ sessions, isLoading, error, onRetry }: WeekClassesProps) {
  const [now] = useState(() => Date.now())
  const [cancelling, setCancelling] = useState<SessionWithDetails | null>(null)
  const todayKey = getTodayKey()
  const atRiskCount = sessions ? countAtRisk(sessions, now) : 0

  return (
    <section aria-labelledby="week-title" className="rounded-2xl border border-line bg-surface/80 p-5 shadow-card">
      <header className="mb-5 flex items-center gap-3">
        <IconTile icon={CalendarRange} tone="rosa" />
        <div className="min-w-0 flex-1">
          <h2 id="week-title" className="font-display text-base font-bold leading-tight">
            Clases de la semana
          </h2>
          <p className="text-xs text-fg-muted">Las que no llegan al mínimo de reservas se marcan para que decidas si las cancelas.</p>
        </div>
        {atRiskCount > 0 && (
          <span className="shrink-0 rounded-full bg-warn-soft px-2.5 py-1 text-xs font-bold tabular-nums text-warn">{atRiskCount} en riesgo</span>
        )}
      </header>
      <AsyncContent
        isLoading={isLoading}
        error={error}
        onRetry={onRetry}
        isEmpty={!sessions || sessions.length === 0}
        loading={
          <>
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </>
        }
        empty={<EmptyState illustration="calendar" title="Sin clases esta semana" description="Genera las sesiones desde la agenda o programa una." />}
      >
        <div className="flex flex-col gap-5">
          {groupByDay(sessions ?? []).map(([dayKey, daySessions]) => (
            <section key={dayKey} aria-label={formatters.fullDate(daySessions[0]?.starts_at ?? dayKey)} className="flex flex-col gap-2">
              <h3 className="flex items-center gap-2 font-display text-sm font-bold capitalize">
                {formatters.fullDate(daySessions[0]?.starts_at ?? dayKey)}
                {dayKey === todayKey && <span className="rounded-full bg-rosa px-2 py-0.5 text-[11px] font-semibold normal-case text-white">Hoy</span>}
              </h3>
              <ul className="flex flex-col gap-2">
                {daySessions.map((session) => (
                  <SessionRow key={session.id} session={session} now={now} isToday={dayKey === todayKey} onCancel={setCancelling} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      </AsyncContent>
      {cancelling && <CancelSessionDialog session={cancelling} open onOpenChange={(open) => !open && setCancelling(null)} />}
    </section>
  )
}
