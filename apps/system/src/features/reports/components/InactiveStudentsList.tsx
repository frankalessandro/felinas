import { Link } from '@tanstack/react-router'
import { Stamp } from '@/components/brand'
import { AsyncContent, Avatar, EmptyState } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { formatters } from '@/lib/dates'
import { getDefaultRange } from '../range'
import type { InactiveStudent } from '../types'

const WHATSAPP_MESSAGE = 'Hola, te extrañamos en clase. ¿Te esperamos esta semana?'

interface InactiveStudentsListProps {
  students: InactiveStudent[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  /** Máximo de filas a mostrar (dashboard). Sin valor muestra todas. */
  limit?: number
}

function lastSeenLabel(student: InactiveStudent): string {
  return student.last_attended_at ? `Última clase: ${formatters.shortDate(student.last_attended_at)}` : 'Aún no ha asistido'
}

export function InactiveStudentsList({ students, isLoading, error, onRetry, limit }: InactiveStudentsListProps) {
  const visible = limit ? students?.slice(0, limit) : students
  const hidden = limit && students ? Math.max(0, students.length - limit) : 0
  return (
    <AsyncContent
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!students || students.length === 0}
      empty={<EmptyState illustration="success" title="Todas las alumnas están al día" description="Nadie lleva más de 14 días sin asistir." className="py-7" />}
    >
      <ul className="flex flex-col gap-2">
        {visible?.map((student) => (
          <li key={student.student_id} className="flex items-center gap-3 rounded-xl bg-surface-2/60 p-2.5">
            <Avatar name={student.full_name ?? 'Alumna'} src={student.avatar_url} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{student.full_name ?? student.email}</p>
              <p className="truncate text-xs text-fg-muted">{lastSeenLabel(student)}</p>
            </div>
            <Stamp tone="warn">
              <span className="sr-only">Sin asistir: </span>
              {student.days_inactive} d
            </Stamp>
            <WhatsAppButton phone={student.phone} name={student.full_name ?? 'la alumna'} message={WHATSAPP_MESSAGE} size="icon" />
          </li>
        ))}
      </ul>
      {hidden > 0 && (
        <p className="pt-3 text-xs text-fg-muted">
          y {hidden} más en{' '}
          <Link to="/admin/reports" search={{ ...getDefaultRange(), tab: 'students' }} className="font-semibold text-rosa-hover underline-offset-2 hover:underline">
            Reportes
          </Link>
          .
        </p>
      )}
    </AsyncContent>
  )
}
