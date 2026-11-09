import { NotebookPen } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Button, Dialog, EmptyState } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { formatters } from '@/lib/dates'
import { useStudentNotes } from '../hooks/useTeacherStudents'
import { getStudentName } from '../lib'
import type { NoteWithSession, StudentContact } from '../types'
import { NoteDialog } from './NoteDialog'

interface StudentNotesDialogProps {
  student: StudentContact
  onClose: () => void
}

function describeNoteContext(note: NoteWithSession): string {
  const date = formatters.shortDate(note.created_at)
  const className = note.session?.title ?? note.session?.class_type?.name
  return className ? `${date} · ${className}` : date
}

export function StudentNotesDialog({ student, onClose }: StudentNotesDialogProps) {
  const profile = useCurrentProfile()
  const notes = useStudentNotes(student.id)
  const [adding, setAdding] = useState(false)
  const name = getStudentName(student)

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={name}
      description="Tus notas de seguimiento"
      footer={
        <Button onClick={() => setAdding(true)}>
          <NotebookPen className="size-4" aria-hidden />
          Agregar nota
        </Button>
      }
    >
      <AsyncContent
        isLoading={notes.isLoading}
        error={notes.error}
        onRetry={() => void notes.refetch()}
        isEmpty={(notes.data ?? []).length === 0}
        empty={<EmptyState illustration="search" title="Sin notas todavía" description="Las notas que escribas sobre esta alumna aparecerán aquí." className="py-6" />}
      >
        <ul className="flex flex-col gap-3 pb-2">
          {(notes.data ?? []).map((note) => (
            <li key={note.id} className="relative flex flex-col gap-1.5 overflow-hidden rounded-2xl border border-line bg-surface-2/60 p-4 pl-5">
              <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-rosa" />
              <p className="text-xs font-semibold text-rosa-hover">{describeNoteContext(note)}</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.body}</p>
            </li>
          ))}
        </ul>
      </AsyncContent>
      {adding && (
        <NoteDialog onClose={() => setAdding(false)} studentId={student.id} studentName={name} authorId={profile.id} sessionId={null} />
      )}
    </Dialog>
  )
}
