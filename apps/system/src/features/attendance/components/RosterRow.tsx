import { MinusCircle } from 'lucide-react'
import { Avatar, Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { AttendanceStatus, RosterEntry, RosterPlan } from '../types'
import { AttendanceButtons } from './AttendanceButtons'

const LOW_CLASSES_THRESHOLD = 2

const STATUS_EDGE: Record<AttendanceStatus, string> = {
  present: 'bg-ok',
  absent: 'bg-danger',
  excused: 'bg-warn',
}

function PlanBadge({ plan }: { plan: RosterPlan }) {
  if (plan.classesRemaining === null) return <Badge>{plan.planName}</Badge>
  const low = plan.classesRemaining <= LOW_CLASSES_THRESHOLD
  const label = plan.classesRemaining === 1 ? 'Queda 1 clase' : `Quedan ${plan.classesRemaining} clases`
  return <Badge tone={low || plan.isExpiring ? 'warn' : 'neutral'}>{label}</Badge>
}

/** Deja a la vista qué pasó con el saldo: cuánto se descontó y cuánto queda. */
function DiscountNote({ entry }: { entry: RosterEntry }) {
  const remaining = entry.plan?.classesRemaining ?? null
  if (entry.status === 'present') {
    return (
      <p className="inline-flex items-center gap-1 text-xs font-semibold text-ok">
        <MinusCircle className="size-3.5" aria-hidden />
        Se descontó 1 clase{remaining !== null && ` · quedan ${remaining}`}
      </p>
    )
  }
  if (entry.status) return <p className="text-xs text-fg-muted">No descuenta clase</p>
  return <p className="text-xs text-fg-subtle">Se descuenta al marcar «Asistió»</p>
}

interface RosterRowProps {
  entry: RosterEntry
  onMark: (bookingId: string, status: AttendanceStatus) => void
}

export function RosterRow({ entry, onMark }: RosterRowProps) {
  const name = entry.student.full_name ?? entry.student.email ?? 'Alumna'
  return (
    <li className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 sm:flex-row sm:items-center sm:justify-between">
      <span aria-hidden className={cn('absolute inset-y-0 left-0 w-1.5 transition-colors', entry.status ? STATUS_EDGE[entry.status] : 'bg-line-strong')} />
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} src={entry.student.avatar_url} />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="truncate font-display text-base font-bold">{name}</p>
          <div className="flex flex-wrap gap-1.5">
            {entry.plan ? <PlanBadge plan={entry.plan} /> : <Badge tone="danger">Sin plan asignado</Badge>}
          </div>
          <DiscountNote entry={entry} />
        </div>
      </div>
      <div className="sm:w-96">
        <AttendanceButtons studentName={name} value={entry.status} onChange={(status) => onMark(entry.bookingId, status)} />
      </div>
    </li>
  )
}
