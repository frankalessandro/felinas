import { NotebookPen } from 'lucide-react'
import { Avatar, Badge, Button } from '@/components/ui'
import type { BadgeTone } from '@/components/ui'
import { getStudentName } from '../lib'
import type { AttendanceStatus, RosterEntry } from '../types'
import { StudentContactActions } from './StudentContactActions'

const ATTENDANCE_BADGE: Record<AttendanceStatus, { label: string; tone: BadgeTone }> = {
  present: { label: 'Asistió', tone: 'ok' },
  absent: { label: 'No asistió', tone: 'danger' },
  excused: { label: 'Justificada', tone: 'warn' },
}

interface RosterRowProps {
  entry: RosterEntry
  notesCount: number
  onAddNote: (entry: RosterEntry) => void
}

export function RosterRow({ entry, notesCount, onAddNote }: RosterRowProps) {
  const name = getStudentName(entry.student)
  const attendance = entry.attendance ? ATTENDANCE_BADGE[entry.attendance.status] : null

  return (
    <li className="flex flex-col gap-3 rounded-2xl border border-line bg-surface-2/60 p-3">
      <div className="flex items-center gap-3">
        <Avatar name={name} src={entry.student?.avatar_url} size="lg" />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <p className="truncate font-display text-base font-bold">{name}</p>
          <div className="flex flex-wrap items-center gap-1.5">
            {entry.status === 'waitlist' && <Badge tone="warn">Espera #{entry.waitlist_position ?? '–'}</Badge>}
            {attendance && <Badge tone={attendance.tone}>{attendance.label}</Badge>}
            {notesCount > 0 && <Badge tone="rosa">{notesCount === 1 ? '1 nota' : `${notesCount} notas`}</Badge>}
          </div>
          {entry.student?.phone && <p className="text-xs text-fg-muted">{entry.student.phone}</p>}
        </div>
        <StudentContactActions phone={entry.student?.phone ?? null} name={name} />
      </div>
      {entry.student && (
        <Button variant="outline" size="md" onClick={() => onAddNote(entry)}>
          <NotebookPen className="size-4" aria-hidden />
          Agregar nota
        </Button>
      )}
    </li>
  )
}
