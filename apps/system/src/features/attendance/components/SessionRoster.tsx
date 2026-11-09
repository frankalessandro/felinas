import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { CheckCheck } from 'lucide-react'
import { Meter } from '@/components/brand'
import { AsyncContent, Button, EmptyState } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { cn } from '@/lib/cn'
import { useMarkAttendance } from '../hooks/useMarkAttendance'
import { rosterQuery } from '../queries'
import type { AttendanceStatus } from '../types'
import { RosterRow } from './RosterRow'

interface SessionRosterProps {
  session: SessionWithDetails
}

export function SessionRoster({ session }: SessionRosterProps) {
  const roster = useQuery(rosterQuery(session.id))
  const mark = useMarkAttendance(session.id)
  const [markingAll, setMarkingAll] = useState(false)

  const entries = roster.data ?? []
  const pending = entries.filter((entry) => entry.status === null)
  const marked = entries.length - pending.length
  const allMarked = marked === entries.length && entries.length > 0

  function handleMark(bookingId: string, status: AttendanceStatus) {
    mark.mutate({ bookingId, status })
  }

  async function markAllPresent() {
    setMarkingAll(true)
    try {
      for (const entry of pending) {
        await mark.mutateAsync({ bookingId: entry.bookingId, status: 'present' })
      }
    } catch {
      // El error ya se notificó en el hook; se detiene para no seguir marcando a ciegas.
    } finally {
      setMarkingAll(false)
    }
  }

  return (
    <section aria-label="Lista de asistencia" className="flex flex-col gap-4">
      <div className="flex items-center gap-4 rounded-2xl bg-surface-2/70 p-4">
        <Meter
          value={marked}
          max={Math.max(entries.length, 1)}
          tone={allMarked ? 'ok' : 'rosa'}
          label={`${marked} de ${entries.length} alumnas marcadas`}
          size={60}
        >
          <span className={cn('font-display text-sm font-bold tabular-nums', allMarked ? 'text-ok' : 'text-fg')}>
            {marked}/{entries.length}
          </span>
        </Meter>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-bold">{allMarked ? 'Lista completa' : `${pending.length} por marcar`}</p>
          <p className="text-xs text-fg-muted">{entries.length} {entries.length === 1 ? 'reserva' : 'reservas'} en esta clase</p>
        </div>
        {pending.length > 0 && (
          <Button onClick={() => void markAllPresent()} loading={markingAll} className="shrink-0">
            <CheckCheck className="size-5" aria-hidden />
            Todas asistieron
          </Button>
        )}
      </div>

      {session.status === 'cancelled' ? (
        <EmptyState illustration="calendar" title="Clase cancelada" description={session.cancel_reason ?? 'Esta clase no se dictó, no hay asistencia que marcar.'} />
      ) : (
        <AsyncContent
          isLoading={roster.isLoading}
          error={roster.error}
          onRetry={() => void roster.refetch()}
          isEmpty={entries.length === 0}
          empty={<EmptyState illustration="people" title="Nadie reservó esta clase" description="Puedes agregar alumnas desde la agenda." />}
        >
          <ul className="flex flex-col gap-3">
            {entries.map((entry) => (
              <RosterRow key={entry.bookingId} entry={entry} onMark={handleMark} />
            ))}
          </ul>
        </AsyncContent>
      )}
    </section>
  )
}
