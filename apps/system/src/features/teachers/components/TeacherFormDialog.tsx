import { ColorPicker } from '@/components/form/ColorPicker'
import { Button, Dialog, Field, Input, Textarea } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { useSaveTeacher } from '../hooks/useTeacherMutations'
import { DEFAULT_TEACHER_COLOR } from '../lib'
import { teacherFormSchema } from '../schemas'
import type { TeacherFormValues } from '../schemas'
import type { Teacher } from '../types'

interface TeacherFormDialogProps {
  teacher: Teacher | null
  onClose: () => void
}

const FORM_ID = 'teacher-form'

function toFormValues(teacher: Teacher | null): TeacherFormValues {
  return {
    full_name: teacher?.full_name ?? '',
    bio: teacher?.bio ?? '',
    photo_url: teacher?.photo_url ?? '',
    phone: teacher?.phone ?? '',
    instagram: teacher?.instagram ?? '',
    color: teacher?.color ?? DEFAULT_TEACHER_COLOR,
  }
}

export function TeacherFormDialog({ teacher, onClose }: TeacherFormDialogProps) {
  const mutation = useSaveTeacher(teacher?.id)
  const form = useZodForm(teacherFormSchema, toFormValues(teacher))
  const { values, errors, setValue } = form

  const save = form.submit((data) => mutation.mutateAsync(data).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={teacher ? 'Editar profe' : 'Nueva profe'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Guardar
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <Field label="Nombre completo" error={errors.full_name} required>
          <Input value={values.full_name} onChange={(e) => setValue('full_name', e.target.value)} maxLength={80} />
        </Field>
        <Field label="Foto (enlace)" error={errors.photo_url} hint="Pega la URL de una imagen. Si queda vacío se usan las iniciales.">
          <Input type="url" inputMode="url" value={values.photo_url} onChange={(e) => setValue('photo_url', e.target.value)} placeholder="https://…" />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Teléfono" error={errors.phone}>
            <Input type="tel" value={values.phone} onChange={(e) => setValue('phone', e.target.value)} placeholder="300 123 4567" />
          </Field>
          <Field label="Instagram" error={errors.instagram} hint="Usuario, sin enlace.">
            <Input value={values.instagram} onChange={(e) => setValue('instagram', e.target.value)} placeholder="@pantera.felinas" autoCapitalize="none" />
          </Field>
        </div>
        <Field label="Bio" error={errors.bio}>
          <Textarea rows={3} value={values.bio} onChange={(e) => setValue('bio', e.target.value)} />
        </Field>
        <Field label="Color" error={errors.color} hint="Identifica a la profe en la agenda.">
          <ColorPicker value={values.color} onChange={(color) => setValue('color', color)} />
        </Field>
      </form>
    </Dialog>
  )
}
