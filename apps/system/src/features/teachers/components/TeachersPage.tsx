import { useQuery } from '@tanstack/react-query'
import { GraduationCap, Plus } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Button, ConfirmDialog, EmptyState, PageHeader, Skeleton } from '@/components/ui'
import { useToggleTeacher } from '../hooks/useTeacherMutations'
import { teachersQuery } from '../queries'
import type { TeacherWithSchedules } from '../types'
import { TeacherCard } from './TeacherCard'
import { TeacherDetailDialog } from './TeacherDetailDialog'
import { TeacherFormDialog } from './TeacherFormDialog'

interface TeachersPageProps {
  selectedId?: string
  onSelect: (teacherId: string | undefined) => void
}

type FormState = { teacher: TeacherWithSchedules | null } | null

export function TeachersPage({ selectedId, onSelect }: TeachersPageProps) {
  const query = useQuery(teachersQuery())
  const toggle = useToggleTeacher()
  const [form, setForm] = useState<FormState>(null)
  const [deactivating, setDeactivating] = useState<TeacherWithSchedules | null>(null)

  const selected = query.data?.find((teacher) => teacher.id === selectedId)

  function handleToggle(teacher: TeacherWithSchedules) {
    if (teacher.active) setDeactivating(teacher)
    else toggle.mutate({ id: teacher.id, active: true })
  }

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        icon={GraduationCap}
        title="Profes"
        description="Perfil, estilos que dictan y horario semanal de cada profe."
        actions={
          <Button onClick={() => setForm({ teacher: null })}>
            <Plus className="size-4" aria-hidden /> Nueva profe
          </Button>
        }
      />

      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={query.data?.length === 0}
        onRetry={() => query.refetch()}
        loading={
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-72" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            illustration="people"
            title="Aún no hay profes"
            description="Crea el perfil de cada profe para asignarle horarios."
            action={<Button onClick={() => setForm({ teacher: null })}>Crear profe</Button>}
          />
        }
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {query.data?.map((teacher) => (
            <TeacherCard
              key={teacher.id}
              teacher={teacher}
              onOpen={() => onSelect(teacher.id)}
              onEdit={() => setForm({ teacher })}
              onToggleActive={() => handleToggle(teacher)}
            />
          ))}
        </div>
      </AsyncContent>

      {form && <TeacherFormDialog teacher={form.teacher} onClose={() => setForm(null)} />}
      {selected && <TeacherDetailDialog teacher={selected} onClose={() => onSelect(undefined)} />}
      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title={`¿Desactivar a ${deactivating?.full_name ?? ''}?`}
        description="No se podrá elegir al crear horarios nuevos. Su historial y sus sesiones ya creadas se conservan."
        confirmLabel="Desactivar"
        tone="danger"
        onConfirm={() => (deactivating ? toggle.mutateAsync({ id: deactivating.id, active: false }).then(() => undefined, () => undefined) : undefined)}
      />
    </div>
  )
}
