import { useQuery } from '@tanstack/react-query'
import { ColorPicker } from '@/components/form/ColorPicker'
import { SwitchField } from '@/components/form/SwitchField'
import { Button, Dialog, Field, Input, Select, Textarea } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { DEFAULT_CLASS_COLOR, LEVEL_OPTIONS } from '../constants'
import { useSaveClassType } from '../hooks/useClassMutations'
import { classCategoriesQuery } from '../queries'
import { NO_CATEGORY, classTypeFormSchema } from '../schemas'
import type { ClassTypeFormValues } from '../schemas'
import type { ClassLevel, ClassType } from '../types'

interface ClassTypeFormDialogProps {
  classType: ClassType | null
  onClose: () => void
}

const FORM_ID = 'class-type-form'

function toFormValues(classType: ClassType | null): ClassTypeFormValues {
  return {
    name: classType?.name ?? '',
    description: classType?.description ?? '',
    level: classType?.level ?? 'all',
    category_id: classType?.category_id ?? NO_CATEGORY,
    color: classType?.color ?? DEFAULT_CLASS_COLOR,
    active: classType?.active ?? true,
  }
}

/** Se monta solo mientras está abierto, así el formulario siempre arranca limpio. */
export function ClassTypeFormDialog({ classType, onClose }: ClassTypeFormDialogProps) {
  const mutation = useSaveClassType(classType?.id)
  const categories = useQuery(classCategoriesQuery())
  const categoryOptions = [{ value: NO_CATEGORY, label: 'Sin categoría' }, ...(categories.data ?? []).map((c) => ({ value: c.id, label: c.name }))]
  const form = useZodForm(classTypeFormSchema, toFormValues(classType))
  const { values, errors, setValue } = form

  const save = form.submit((data) => mutation.mutateAsync(data).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={classType ? 'Editar estilo' : 'Nuevo estilo'}
      description="Los estilos son las categorías de clase que verán las alumnas."
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
        <Field label="Nombre" error={errors.name} required>
          <Input value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder="Ej. Hip Hop" maxLength={60} />
        </Field>
        <Field label="Descripción" error={errors.description}>
          <Textarea rows={3} value={values.description} onChange={(e) => setValue('description', e.target.value)} />
        </Field>
        <Field label="Categoría" error={errors.category_id} hint="Agrupa estilos (Twerk, Urbano…) para los planes y los reportes.">
          <Select options={categoryOptions} value={values.category_id} onValueChange={(id) => setValue('category_id', id)} />
        </Field>
        <Field label="Nivel" error={errors.level}>
          <Select options={LEVEL_OPTIONS} value={values.level} onValueChange={(level) => setValue('level', level as ClassLevel)} />
        </Field>
        <Field label="Color" error={errors.color} hint="Se usa en la agenda, badges y tarjetas del estilo.">
          <ColorPicker value={values.color} onChange={(color) => setValue('color', color)} />
        </Field>
        <SwitchField
          label="Activo"
          description="Los estilos inactivos no se pueden elegir en horarios nuevos."
          checked={values.active}
          onCheckedChange={(active) => setValue('active', active)}
        />
      </form>
    </Dialog>
  )
}
