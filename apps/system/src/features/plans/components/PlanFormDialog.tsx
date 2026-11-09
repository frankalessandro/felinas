import { useQuery } from '@tanstack/react-query'
import { SwitchField } from '@/components/form/SwitchField'
import { Button, Dialog, Field, Input, SegmentedControl, Textarea } from '@/components/ui'
import { classTypesQuery } from '@/features/classes/queries'
import { useZodForm } from '@/hooks/useZodForm'
import { useSavePlan } from '../hooks/usePlanMutations'
import { categoriesQuery } from '../queries'
import { planFormSchema } from '../schemas'
import type { PlanFormValues } from '../schemas'
import type { PlanType, PlanValidity, PlanWithClassTypes } from '../types'
import { ClassTypeChips } from './ClassTypeChips'

interface PlanFormDialogProps {
  plan: PlanWithClassTypes | null
  onClose: () => void
}

function toFormValues(plan: PlanWithClassTypes | null): PlanFormValues {
  return {
    name: plan?.name ?? '',
    description: plan?.description ?? '',
    type: plan?.type ?? 'package',
    class_count: plan?.class_count ? String(plan.class_count) : '',
    weekly_limit: plan?.weekly_limit ? String(plan.weekly_limit) : '',
    validity: plan?.validity ?? 'calendar_month',
    duration_days: plan ? String(plan.duration_days) : '30',
    price: plan?.price != null ? String(plan.price) : '',
    is_private: plan?.is_private ?? false,
    active: plan?.active ?? true,
    class_type_ids: plan?.plan_class_types.map((row) => row.class_type_id) ?? [],
    quotas: Object.fromEntries((plan?.plan_category_quotas ?? []).map((quota) => [quota.category_id, String(quota.max_classes)])),
  }
}

const FORM_ID = 'plan-form'

const VALIDITY_OPTIONS: { value: PlanValidity; label: string }[] = [
  { value: 'calendar_month', label: 'Mes calendario' },
  { value: 'days', label: 'Por días' },
]

const TYPE_OPTIONS: { value: PlanType; label: string }[] = [
  { value: 'package', label: 'Paquete de clases' },
  { value: 'monthly', label: 'Mensualidad' },
]

export function PlanFormDialog({ plan, onClose }: PlanFormDialogProps) {
  
  const mutation = useSavePlan(plan?.id)
  const form = useZodForm(planFormSchema, toFormValues(plan))
  const { values, errors, setValue } = form
  const { data: classTypes = [] } = useQuery(classTypesQuery())
  const { data: categories = [] } = useQuery(categoriesQuery())

  // Un estilo archivado seguirá visible solo si el plan todavía lo tenía.
  const availableTypes = classTypes.filter((type) => type.active || values.class_type_ids.includes(type.id))
  const save = form.submit((data) => mutation.mutateAsync(data).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={plan ? 'Editar plan' : 'Nuevo plan'}
      description="Define cuántas clases incluye y a qué estilos da acceso."
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
          <Input value={values.name} onChange={(e) => setValue('name', e.target.value)} placeholder="Ej. Paquete 8 clases" maxLength={80} />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Tipo de plan</span>
          <SegmentedControl
            label="Tipo de plan"
            value={values.type}
            onValueChange={(type) => setValue('type', type)}
            options={TYPE_OPTIONS}
            className="w-full [&>button]:flex-1"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          {values.type === 'package' ? (
            <Field label="Cantidad de clases" error={errors.class_count} required>
              <Input inputMode="numeric" value={values.class_count} onChange={(e) => setValue('class_count', e.target.value)} placeholder="8" />
            </Field>
          ) : (
            <Field label="Clases por semana" error={errors.weekly_limit} required>
              <Input inputMode="numeric" value={values.weekly_limit} onChange={(e) => setValue('weekly_limit', e.target.value)} placeholder="2" />
            </Field>
          )}
          {values.validity === 'days' && (
            <Field label="Duración (días)" error={errors.duration_days} required>
              <Input inputMode="numeric" value={values.duration_days} onChange={(e) => setValue('duration_days', e.target.value)} />
            </Field>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Vigencia</span>
          <SegmentedControl
            label="Vigencia del plan"
            value={values.validity}
            onValueChange={(validity) => setValue('validity', validity)}
            options={VALIDITY_OPTIONS}
            className="w-full [&>button]:flex-1"
          />
          <p className="text-xs text-fg-muted">
            {values.validity === 'calendar_month'
              ? 'Vence el último día del mes en que se asigna. Las clases que sobran se pierden.'
              : 'Vence pasados los días indicados desde que empieza.'}
          </p>
        </div>

        <Field label="Precio (COP)" error={errors.price} hint="Precio de catálogo. Se copia al asignar el plan y se puede ajustar por alumna.">
          <Input inputMode="decimal" value={values.price} onChange={(e) => setValue('price', e.target.value)} placeholder="160000" />
        </Field>

        {categories.length > 0 && (
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-semibold text-fg">Cupo por categoría</legend>
            <p className="text-xs text-fg-muted">
              Opcional. Máximo de clases de cada categoría dentro del plan (ej. 3 Twerk + 1 Urbano). Vacío = sin límite.
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-1.5"
                >
                  <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: category.color }} />
                  <span className="flex-1 text-sm font-semibold">{category.name}</span>
                  <span className="text-xs text-fg-muted">máx.</span>
                  <Input
                    inputMode="numeric"
                    aria-label={`Máximo de clases de ${category.name}`}
                    value={values.quotas[category.id] ?? ''}
                    onChange={(e) => setValue('quotas', { ...values.quotas, [category.id]: e.target.value })}
                    placeholder="—"
                    className="min-h-9 w-16 px-2 text-center"
                  />
                </label>
              ))}
            </div>
            {errors.quotas && (
              <p role="alert" className="text-xs font-medium text-danger">
                {errors.quotas}
              </p>
            )}
          </fieldset>
        )}

        <Field label="Estilos permitidos" error={errors.class_type_ids} required>
          <ClassTypeChips
            classTypes={availableTypes}
            selectedIds={values.class_type_ids}
            onChange={(ids) => setValue('class_type_ids', ids)}
          />
        </Field>

        <Field label="Descripción" error={errors.description}>
          <Textarea rows={2} value={values.description} onChange={(e) => setValue('description', e.target.value)} />
        </Field>

        <SwitchField
          label="Clases personalizadas"
          description="Plan privado: solo cubre clases que agenda el admin, no las grupales."
          checked={values.is_private}
          onCheckedChange={(isPrivate) => setValue('is_private', isPrivate)}
        />
        <SwitchField
          label="Activo"
          description="Los planes inactivos no se pueden asignar."
          checked={values.active}
          onCheckedChange={(active) => setValue('active', active)}
        />
      </form>
    </Dialog>
  )
}
