import { Link } from '@tanstack/react-router'
import { Stamp } from '@/components/brand'
import { AsyncContent, Avatar, EmptyState } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { getDefaultRange } from '../range'
import { atRiskMessage, describeDaysSince, describeUsualFrequency } from '../atRisk'
import type { AtRiskStudent } from '../types'

interface AtRiskListProps {
  students: AtRiskStudent[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
  /** Máximo de filas a mostrar (dashboard). Sin valor muestra todas. */
  limit?: number
}

export function AtRiskList({ students, isLoading, error, onRetry, limit }: AtRiskListProps) {
  const visible = limit ? students?.slice(0, limit) : students
  const hidden = limit && students ? Math.max(0, students.length - limit) : 0
  return (
    <AsyncContent
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!students || students.length === 0}
      empty={<EmptyState illustration="people" title="Nadie en riesgo" description="Las alumnas constantes siguen viniendo." className="py-7" />}
    >
      <ul className="flex flex-col gap-2">
        {visible?.map((student) => {
          const name = student.full_name ?? 'Alumna'
          return (
            <li key={student.student_id} className="flex items-center gap-3 rounded-xl bg-surface-2/60 p-2.5">
              <Avatar name={name} src={student.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-fg-muted">
                  {describeUsualFrequency(student.usual_weekly)} · última clase {describeDaysSince(student.days_since)}
                </p>
              </div>
              <Stamp tone="danger">
                <span className="sr-only">Sin asistir: </span>
                {student.days_since} d
              </Stamp>
              <WhatsAppButton phone={student.phone} name={name} message={atRiskMessage(student)} size="icon" />
            </li>
          )
        })}
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
