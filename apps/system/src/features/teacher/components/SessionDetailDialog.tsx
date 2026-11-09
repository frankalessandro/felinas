import { useQuery } from '@tanstack/react-query'
import { Ban, DoorOpen } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Badge, CapacityBar, Dialog, EmptyState } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { sessionQuery } from '@/features/schedule/queries'
import type { SessionWithDetails } from '@/features/schedule/types'
import { formatters } from '@/lib/dates'
import { useSessionNotes, useSessionRoster } from '../hooks/useSessionRoster'
import { getStudentName, splitRoster } from '../lib'
import type { RosterEntry } from '../types'
import { NoteDialog } from './NoteDialog'
import { RosterRow } from './RosterRow'

interface SessionDetailDialogProps {
  sessionId: string
  onClose: () => void
}

export function SessionDetailDialog({ sessionId, onClose }: SessionDetailDialogProps) {
  const sessionResult = useQuery(sessionQuery(sessionId))
  const session = sessionResult.data

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={session ? (session.title ?? session.class_type?.name ?? 'Clase') : 'Clase'}
      description={session ? `${formatters.fullDate(session.starts_at)} · ${formatters.timeRange(session.starts_at, session.ends_at)}` : undefined}
      className="md:max-w-xl"
    >
      <AsyncContent isLoading={sessionResult.isLoading} error={sessionResult.error} onRetry={() => void sessionResult.refetch()}>
        {session && <SessionBody session={session} />}
      </AsyncContent>
    </Dialog>
  )
}

function SessionBody({ session }: { session: SessionWithDetails }) {
  const profile = useCurrentProfile()
  const roster = useSessionRoster(session.id)
  const notes = useSessionNotes(session.id)
  const [noteFor, setNoteFor] = useState<RosterEntry | null>(null)
  const { booked, waitlist } = splitRoster(roster.data ?? [])

  const notesCount = (studentId: string) => (notes.data ?? []).filter((n) => n.student_id === studentId).length

  return (
    <div className="flex flex-col gap-5 pb-4">
      {session.status === 'cancelled' && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-danger/30 bg-danger-soft p-3 text-sm">
          <Ban className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
          <p>
            <strong className="font-bold text-danger">Clase cancelada.</strong>{' '}
            {session.cancel_reason ?? 'Sin motivo registrado.'}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/60 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {session.class_type && <Badge color={session.class_type.color}>{session.class_type.name}</Badge>}
          {session.kind === 'private' && <Badge tone="dorado">Personalizada</Badge>}
          {session.room && (
            <span className="inline-flex items-center gap-1.5 text-sm text-fg-muted">
              <DoorOpen className="size-4" aria-hidden />
              {session.room.name}
            </span>
          )}
        </div>
        <CapacityBar booked={session.booked_count} capacity={session.capacity} />
        <p className="text-xs text-fg-muted">
          {session.booked_count} reservadas · {session.waitlist_count} en espera
        </p>
      </div>

      <AsyncContent
        isLoading={roster.isLoading}
        error={roster.error}
        onRetry={() => void roster.refetch()}
        isEmpty={(roster.data ?? []).length === 0}
        empty={<EmptyState illustration="people" title="Aún sin reservas" description="Cuando una alumna reserve, aparecerá aquí." className="py-6" />}
      >
        <RosterSection title="Reservadas" entries={booked} notesCount={notesCount} onAddNote={setNoteFor} />
        <RosterSection title="Lista de espera" entries={waitlist} notesCount={notesCount} onAddNote={setNoteFor} />
      </AsyncContent>

      {noteFor?.student && (
        <NoteDialog
          onClose={() => setNoteFor(null)}
          studentId={noteFor.student.id}
          studentName={getStudentName(noteFor.student)}
          authorId={profile.id}
          sessionId={session.id}
        />
      )}
    </div>
  )
}

interface RosterSectionProps {
  title: string
  entries: RosterEntry[]
  notesCount: (studentId: string) => number
  onAddNote: (entry: RosterEntry) => void
}

function RosterSection({ title, entries, notesCount, onAddNote }: RosterSectionProps) {
  if (entries.length === 0) return null
  return (
    <section className="flex flex-col gap-2">
      <h3 className="flex items-center gap-2 font-display text-sm font-bold">
        {title}
        <span className="rounded-full bg-surface-3 px-2 py-0.5 text-xs font-semibold tabular-nums text-fg-muted">{entries.length}</span>
      </h3>
      <ul className="flex flex-col gap-2">
        {entries.map((entry) => (
          <RosterRow key={entry.id} entry={entry} notesCount={entry.student ? notesCount(entry.student.id) : 0} onAddNote={onAddNote} />
        ))}
      </ul>
    </section>
  )
}
