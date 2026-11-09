import { useQuery } from '@tanstack/react-query'
import { Button, Dialog, Field, Input, Select, SegmentedControl, Textarea } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { describePlan, formatCOP } from '@/features/plans/format'
import { plansQuery } from '@/features/plans/queries'
import { currentMonthKey, monthEnd, monthLabel, monthStart, shiftMonth } from '@/features/subscriptions/months'
import { useZodForm } from '@/hooks/useZodForm'
import { formatters, fromDateKey } from '@/lib/dates'
import { formatMoneyInput } from '@/lib/money'
import type { Tables } from '@/types/database'
import { useAssignPlan } from '../hooks/useStudentMutations'
import { assignPlanSchema } from '../schemas'

interface AssignPlanDialogProps {
  studentId: string
  studentName: string
  /** Mes preseleccionado; el tablero de membresías lo elige según el mes que se está viendo. */
  defaultMonth?: 'current' | 'next'
  /** Plan preseleccionado (ej. al asignar desde la página de Planes). */
  defaultPlanId?: string
  onClose: () => void
  /** Se llama con el plan recién creado (ej. para ofrecer registrar el pago). */
  onAssigned?: (plan: Tables<'student_plans'>) => void
}

const FORM_ID = 'assign-plan-form'

export function AssignPlanDialog({ studentId, studentName, defaultMonth = 'current', defaultPlanId = '', onClose, onAssigned }: AssignPlanDialogProps) {
  const mutation = useAssignPlan(studentId)
  const form = useZodForm(assignPlanSchema, { plan_id: defaultPlanId, month: defaultMonth, price: '', notes: '' })
  const { values, errors, setValue } = form
  const { data: plans = [] } = useQuery(plansQuery())

  const thisMonth = currentMonthKey()
  const targetMonth = values.month === 'current' ? thisMonth : shiftMonth(thisMonth, 1)
  const selectedPlan = plans.find((plan) => plan.id === values.plan_id)

  const options: SelectOption[] = plans
    .filter((plan) => plan.active)
    .map((plan) => ({
      value: plan.id,
      label: `${plan.name} · ${describePlan(plan)}${plan.price !== null ? ` · ${formatCOP(plan.price)}` : ''}`,
    }))

  const save = form.submit((data) =>
    mutation
      .mutateAsync({ planId: data.plan_id, month: monthStart(targetMonth), price: data.price, notes: data.notes })
      .then((plan) => {
        onAssigned?.(plan)
        onClose()
      }, () => undefined),
  )

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Asignar plan"
      description={`El vencimiento y el saldo de clases de ${studentName} se calculan al asignar.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            Asignar plan
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <Field label="Plan" error={errors.plan_id} required>
          <Select options={options} value={values.plan_id} onValueChange={(v) => setValue('plan_id', v)} placeholder="Elige un plan" />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Mes del plan</span>
          <SegmentedControl
            label="Mes del plan"
            value={values.month}
            onValueChange={(month) => setValue('month', month)}
            options={[
              { value: 'current', label: 'Este mes' },
              { value: 'next', label: 'Próximo mes' },
            ]}
            className="w-full [&>button]:flex-1"
          />
          <p className="text-xs text-fg-muted">
            {monthLabel(targetMonth)}: {values.month === 'current' ? 'empieza hoy y ' : 'empieza el día 1 y '}vence el{' '}
            {formatters.dayMonth(fromDateKey(monthEnd(targetMonth)))} (planes por mes calendario).
          </p>
        </div>

        <Field
          label="Valor a pagar (COP)"
          error={errors.price}
          hint={selectedPlan?.price != null ? `Vacío = precio del plan (${formatCOP(selectedPlan.price)}). Escribe otro valor para un descuento.` : 'Opcional. Vacío usa el precio del plan.'}
        >
          <Input
            inputMode="numeric"
            autoComplete="off"
            value={values.price}
            onChange={(e) => setValue('price', formatMoneyInput(e.target.value))}
            placeholder={selectedPlan?.price != null ? formatMoneyInput(String(selectedPlan.price)) : 'Precio del plan'}
          />
        </Field>

        <Field label="Nota" error={errors.notes} hint="Opcional. Ej. promoción aplicada.">
          <Textarea rows={2} value={values.notes} onChange={(e) => setValue('notes', e.target.value)} />
        </Field>
      </form>
    </Dialog>
  )
}
