import { CalendarDays, UserRound } from 'lucide-react'
import { Avatar, EmptyState } from '@/components/ui'
import { formatters } from '@/lib/dates'
import type { ProgressNote } from '../types'

const FALLBACK_COLOR = '#ea1a62'

function NoteCard({ note }: { note: ProgressNote }) {
  const { session } = note
  const color = session?.class_type?.color ?? FALLBACK_COLOR
  const author = session?.teacher ? session.teacher.full_name : 'Equipo de la academia'
  return (
    <li className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6 shadow-card">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color }} />
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-fg-muted">
        {session?.class_type && (
          <span className="inline-flex items-center gap-1.5 font-semibold text-fg">
            <span aria-hidden className="size-2 rounded-full" style={{ backgroundColor: color }} />
            {session.class_type.name}
          </span>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-3.5" aria-hidden />
          {formatters.shortDate(session?.starts_at ?? note.created_at)}
        </span>
      </div>
      <p className="whitespace-pre-line text-[15px] leading-relaxed">{note.body}</p>
      <div className="flex items-center gap-2 border-t border-line pt-3 text-xs text-fg-muted">
        {session?.teacher ? <Avatar name={author} size="sm" /> : <UserRound className="size-4" aria-hidden />}
        <span className="font-semibold">{author}</span>
      </div>
    </li>
  )
}

export function ProgressNotesList({ notes }: { notes: ProgressNote[] }) {
  if (notes.length === 0) {
    return (
      <EmptyState
        illustration="chart"
        title="Aún no tienes notas"
        description="Cuando tus profes escriban comentarios sobre tu progreso, los verás aquí."
      />
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {notes.map((note) => (
        <NoteCard key={note.id} note={note} />
      ))}
    </ul>
  )
}
