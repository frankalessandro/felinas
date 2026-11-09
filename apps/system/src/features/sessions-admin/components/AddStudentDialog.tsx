import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { AsyncContent, Avatar, Badge, Button, Dialog, EmptyState, Field, Input, Select } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import type { StudentSearchResult } from '@/features/students/api/searchStudents.api'
import { formatters } from '@/lib/dates'
import { useAddStudentToSession } from '../hooks/useSessionMutations'
import { useDebouncedValue } from '../hooks/useDebouncedValue'
import { studentPlansQuery, studentSearchQuery } from '../queries'
import type { StudentPlanOption } from '../types'

const SEARCH_DEBOUNCE_MS = 250
const AUTO_PLAN = 'auto'

function describePlan(plan: StudentPlanOption): string {
  const remaining = plan.classesRemaining === null ? '' : ` · quedan ${plan.classesRemaining}`
  return `${plan.planName}${remaining} · vence ${formatters.shortDate(plan.expiresOn)}`
}

interface StudentPickerProps {
  bookedStudentIds: Set<string>
  onPick: (student: StudentSearchResult) => void
}

function StudentPicker({ bookedStudentIds, onPick }: StudentPickerProps) {
  const [term, setTerm] = useState('')
  const debounced = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS)
  const results = useQuery(studentSearchQuery(debounced))

  return (
    <div className="flex flex-col gap-3">
      <Field label="Buscar alumna">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" aria-hidden />
          <Input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Nombre o correo" className="pl-10" autoFocus />
        </div>
      </Field>
      <AsyncContent
        isLoading={results.isLoading}
        error={results.error}
        onRetry={() => void results.refetch()}
        isEmpty={results.data?.length === 0}
        empty={<EmptyState title="Sin resultados" description="Solo aparecen alumnas activas." className="py-6" />}
      >
        <ul className="flex max-h-64 flex-col gap-1 overflow-y-auto">
          {results.data?.map((student) => {
            const booked = bookedStudentIds.has(student.id)
            const name = student.full_name ?? student.email ?? 'Alumna'
            return (
              <li key={student.id}>
                <button
                  type="button"
                  disabled={booked}
                  onClick={() => onPick(student)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2 disabled:opacity-50"
                >
                  <Avatar name={name} src={student.avatar_url} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{name}</span>
                    {student.email && <span className="block truncate text-xs text-fg-muted">{student.email}</span>}
                  </span>
                  {booked && <Badge>Ya reservó</Badge>}
                </button>
              </li>
            )
          })}
        </ul>
      </AsyncContent>
    </div>
  )
}

interface PlanStepProps {
  session: SessionWithDetails
  student: StudentSearchResult
  onBack: () => void
  onDone: () => void
}

function PlanStep({ session, student, onBack, onDone }: PlanStepProps) {
  const [planId, setPlanId] = useState(AUTO_PLAN)
  const plans = useQuery(studentPlansQuery(student.id))
  const add = useAddStudentToSession()
  const name = student.full_name ?? student.email ?? 'Alumna'
  const matching = (plans.data ?? []).filter((plan) => plan.isPrivate === (session.kind === 'private'))
  const willOverflow = session.booked_count >= session.capacity

  async function handleAdd() {
    try {
      await add.mutateAsync({ sessionId: session.id, studentId: student.id, studentPlanId: planId === AUTO_PLAN ? undefined : planId })
      onDone()
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-surface-2 p-3">
        <Avatar name={name} src={student.avatar_url} />
        <p className="min-w-0 flex-1 truncate font-semibold">{name}</p>
        <Button variant="ghost" size="sm" onClick={onBack} disabled={add.isPending}>
          Cambiar
        </Button>
      </div>
      <AsyncContent isLoading={plans.isLoading} error={plans.error} onRetry={() => void plans.refetch()} loading={<div className="h-20" />}>
        <Field
          label="Plan a usar"
          hint={
            matching.length === 0
              ? `Esta alumna no tiene un plan ${session.kind === 'private' ? 'personalizado' : 'grupal'} vigente: la reserva será rechazada.`
              : 'El descuento ocurre al marcar asistencia, no ahora.'
          }
        >
          <Select
            value={planId}
            onValueChange={setPlanId}
            options={[
              { value: AUTO_PLAN, label: 'Automático (el sistema elige)' },
              ...matching.map((plan) => ({ value: plan.studentPlanId, label: describePlan(plan) })),
            ]}
          />
        </Field>
      </AsyncContent>
      {willOverflow && <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">La clase está llena: como admin puedes superar el cupo.</p>}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onDone} disabled={add.isPending}>
          Cancelar
        </Button>
        <Button onClick={() => void handleAdd()} loading={add.isPending}>
          Agregar a la clase
        </Button>
      </div>
    </div>
  )
}

interface AddStudentDialogProps {
  session: SessionWithDetails
  bookedStudentIds: Set<string>
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStudentDialog({ session, bookedStudentIds, open, onOpenChange }: AddStudentDialogProps) {
  const [student, setStudent] = useState<StudentSearchResult | null>(null)

  function handleOpenChange(next: boolean) {
    if (!next) setStudent(null)
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange} title="Agregar alumna" description="Reserva un cupo en esta clase en nombre de la alumna.">
      {student ? (
        <PlanStep session={session} student={student} onBack={() => setStudent(null)} onDone={() => handleOpenChange(false)} />
      ) : (
        <StudentPicker bookedStudentIds={bookedStudentIds} onPick={setStudent} />
      )}
    </Dialog>
  )
}
