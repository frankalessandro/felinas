import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { AsyncContent, Avatar, Dialog, EmptyState, Field, Input } from '@/components/ui'
import { useDebouncedValue } from '@/features/sessions-admin/hooks/useDebouncedValue'
import { studentSearchQuery } from '@/features/sessions-admin/queries'
import type { StudentSearchResult } from '@/features/students/api/searchStudents.api'
import { AssignPlanDialog } from '@/features/students/components/AssignPlanDialog'
import type { Plan } from '../types'

const SEARCH_DEBOUNCE_MS = 250

interface AssignToStudentDialogProps {
  plan: Pick<Plan, 'id' | 'name'>
  onClose: () => void
}

/** Paso 1: elegir alumna. Paso 2: el diálogo de asignación ya existe, con el plan preseleccionado. */
export function AssignToStudentDialog({ plan, onClose }: AssignToStudentDialogProps) {
  const [student, setStudent] = useState<StudentSearchResult | null>(null)
  const [term, setTerm] = useState('')
  const debounced = useDebouncedValue(term.trim(), SEARCH_DEBOUNCE_MS)
  const results = useQuery(studentSearchQuery(debounced))

  if (student) {
    return (
      <AssignPlanDialog
        studentId={student.id}
        studentName={student.full_name ?? student.email ?? 'la alumna'}
        defaultPlanId={plan.id}
        onClose={onClose}
      />
    )
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`Asignar «${plan.name}»`}
      description="Busca a la alumna. Si acaba de registrarse, primero apruébala en Usuarios."
    >
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
            {results.data?.map((item) => {
              const name = item.full_name ?? item.email ?? 'Alumna'
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => setStudent(item)}
                    className="flex min-h-14 w-full items-center gap-3 rounded-xl px-3 py-2 text-left transition-colors hover:bg-surface-2"
                  >
                    <Avatar name={name} src={item.avatar_url} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">{name}</span>
                      {item.email && <span className="block truncate text-xs text-fg-muted">{item.email}</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </AsyncContent>
      </div>
    </Dialog>
  )
}
