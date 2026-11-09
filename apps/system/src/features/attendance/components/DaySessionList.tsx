import { EventStatus, SeatPips } from '@/components/calendar'
import { AsyncContent, EmptyState } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { cn } from '@/lib/cn'
import { formatters } from '@/lib/dates'

const FALLBACK_COLOR = 'var(--color-rosa)'

interface DaySessionListProps {
  sessions: SessionWithDetails[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  selectedId?: string
  onSelect: (sessionId: string) => void
}

/** Tarjeta seleccionable de una función: hora, clase, profe y cupos. */
function SessionCard({ session, selected, onSelect }: { session: SessionWithDetails; selected: boolean; onSelect: () => void }) {
  const cancelled = session.status === 'cancelled'
  const color = session.class_type?.color ?? FALLBACK_COLOR
  return (
    <li className="w-64 shrink-0 snap-start">
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        className={cn(
          'relative flex min-h-11 w-full flex-col gap-2 overflow-hidden rounded-2xl border bg-surface p-4 pl-5 text-left transition active:scale-[.98]',
          selected ? 'border-rosa bg-rosa-soft shadow-glow' : 'border-line hover:border-line-strong',
          cancelled && 'opacity-60',
        )}
      >
        <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
        <div className="flex items-center justify-between gap-2">
          <span className="font-display text-xl font-bold leading-none tabular-nums">{formatters.time(session.starts_at)}</span>
          {cancelled ? <EventStatus label="Cancelada" tone="danger" /> : session.kind === 'private' && <EventStatus label="Personalizada" tone="dorado" />}
        </div>
        <p className="truncate font-display text-sm font-bold">{session.title ?? session.class_type?.name ?? 'Clase'}</p>
        <p className="truncate text-xs text-fg-muted">
          {session.teacher?.full_name ?? 'Sin profe'}
          {session.room && ` · ${session.room.name}`}
        </p>
        <SeatPips booked={session.booked_count} capacity={session.capacity} color={color} />
      </button>
    </li>
  )
}

export function DaySessionList({ sessions, isLoading, error, onRetry, selectedId, onSelect }: DaySessionListProps) {
  return (
    <AsyncContent
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!sessions || sessions.length === 0}
      empty={<EmptyState illustration="calendar" title="Hoy no hay clases" description="Cuando haya clases programadas para hoy aparecerán aquí. Puedes crear una desde la agenda." />}
    >
      <ul aria-label="Clases del día" className="hide-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 py-2 sm:mx-0 sm:px-0">
        {sessions?.map((session) => (
          <SessionCard key={session.id} session={session} selected={session.id === selectedId} onSelect={() => onSelect(session.id)} />
        ))}
      </ul>
    </AsyncContent>
  )
}
