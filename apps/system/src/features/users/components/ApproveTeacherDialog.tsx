import { useQuery } from '@tanstack/react-query'
import { Button, Dialog, Field, Input, SegmentedControl, Select } from '@/components/ui'
import { teachersQuery } from '@/features/teachers/queries'
import { useZodForm } from '@/hooks/useZodForm'
import { useApproveTeacher } from '../hooks/useUserMutations'
import { approveTeacherSchema } from '../schemas'
import type { ApproveTeacherFormValues } from '../schemas'
import type { UserProfile } from '../types'

interface ApproveTeacherDialogProps {
  profile: UserProfile
  onClose: () => void
}

const FORM_ID = 'approve-teacher-form'

const MODE_OPTIONS: { value: ApproveTeacherFormValues['mode']; label: string }[] = [
  { value: 'existing', label: 'Ficha existente' },
  { value: 'new', label: 'Crear ficha nueva' },
]

export function ApproveTeacherDialog({ profile, onClose }: ApproveTeacherDialogProps) {
  const mutation = useApproveTeacher()
  const { data: teachers = [], isLoading } = useQuery(teachersQuery())

  // Solo las fichas activas que todavía no tienen cuenta vinculada.
  const available = teachers.filter((teacher) => teacher.active && teacher.profile_id === null)
  const form = useZodForm(approveTeacherSchema, {
    mode: 'existing',
    teacher_id: '',
    new_name: profile.full_name ?? '',
  })
  const { values, errors, setValue } = form

  const save = form.submit((data) => mutation.mutateAsync({ profileId: profile.id, ...data }).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Aprobar como profe"
      description={`Vincula la cuenta de ${profile.full_name ?? profile.email} a una ficha de profe para que vea su agenda.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Aprobar profe
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <SegmentedControl
          label="Origen de la ficha"
          options={MODE_OPTIONS}
          value={values.mode}
          onValueChange={(mode) => setValue('mode', mode)}
          className="w-full [&>button]:flex-1"
        />

        {values.mode === 'existing' ? (
          <Field
            label="Ficha de profe"
            error={errors.teacher_id}
            hint={!isLoading && available.length === 0 ? 'No hay fichas libres. Crea una ficha nueva.' : undefined}
            required
          >
            <Select
              options={available.map((teacher) => ({ value: teacher.id, label: teacher.full_name }))}
              value={values.teacher_id}
              onValueChange={(id) => setValue('teacher_id', id)}
              placeholder={isLoading ? 'Cargando…' : 'Elige la ficha'}
              disabled={available.length === 0}
            />
          </Field>
        ) : (
          <Field label="Nombre de la profe" error={errors.new_name} hint="Podrás completar su perfil después en Profes." required>
            <Input value={values.new_name} onChange={(e) => setValue('new_name', e.target.value)} maxLength={80} />
          </Field>
        )}
      </form>
    </Dialog>
  )
}
