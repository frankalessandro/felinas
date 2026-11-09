import { ChevronRight, Users } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Avatar, EmptyState, PageHeader } from '@/components/ui'
import { formatters } from '@/lib/dates'
import { useTeacherStudents } from '../hooks/useTeacherStudents'
import { getStudentName, STUDENTS_WINDOW_DAYS } from '../lib'
import type { StudentContact, Teacher } from '../types'
import { StudentContactActions } from './StudentContactActions'
import { StudentNotesDialog } from './StudentNotesDialog'

export function TeacherStudents({ teacher }: { teacher: Teacher }) {
  const { data, isLoading, error, refetch } = useTeacherStudents(teacher.id)
  const [selected, setSelected] = useState<StudentContact | null>(null)
  const students = data ?? []

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        icon={Users}
        title="Mis alumnas"
        description={`Alumnas que reservaron tus clases en los últimos ${STUDENTS_WINDOW_DAYS} días.`}
      />
      <AsyncContent
        isLoading={isLoading}
        error={error}
        onRetry={() => void refetch()}
        isEmpty={students.length === 0}
        empty={<EmptyState illustration="people" title="Aún no hay alumnas" description="Cuando reserven tus clases, las verás aquí con tu historial de notas." />}
      >
        <ul className="flex flex-col gap-3">
          {students.map(({ student, classesBooked, lastClassAt }) => {
            const name = getStudentName(student)
            return (
              <li key={student.id} className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-3 transition hover:border-rosa/50">
                <button
                  type="button"
                  onClick={() => setSelected(student)}
                  className="flex min-h-11 flex-1 items-center gap-3 rounded-xl text-left"
                  aria-label={`Ver notas de ${name}`}
                >
                  <Avatar name={name} src={student.avatar_url} size="lg" />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-display text-base font-bold">{name}</span>
                    <span className="text-xs text-fg-muted">
                      {classesBooked === 1 ? '1 clase' : `${classesBooked} clases`} contigo · última {formatters.shortDate(lastClassAt)}
                    </span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-fg-subtle" aria-hidden />
                </button>
                <StudentContactActions phone={student.phone} name={name} />
              </li>
            )
          })}
        </ul>
      </AsyncContent>
      {selected && <StudentNotesDialog student={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}
