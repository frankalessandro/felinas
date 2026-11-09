import { useQuery } from '@tanstack/react-query'
import { Button, Dialog, Field, Input, Select } from '@/components/ui'
import type { SelectOption } from '@/components/ui'
import { describePlan } from '@/features/plans/format'
import { plansQuery } from '@/features/plans/queries'
import { useZodForm } from '@/hooks/useZodForm'
import { toDateKey } from '@/lib/dates'
import { NO_PLAN } from '../constants'
import { useApproveStudent } from '../hooks/useUserMutations'
import { approveStudentSchema } from '../schemas'
import type { UserProfile } from '../types'

interface ApproveStudentDialogProps {
  profile: UserProfile
  onClose: () => void
}

const FORM_ID = 'approve-student-form'

export function ApproveStudentDialog({ profile, onClose }: ApproveStudentDialogProps) {
  const mutation = useApproveStudent()
  const form = useZodForm(approveStudentSchema, { plan_id: NO_PLAN, starts_on: toDateKey(new Date()) })
  const { values, errors, setValue } = form
  const { data: plans = [] } = useQuery(plansQuery())

  const options: SelectOption[] = [
    { value: NO_PLAN, label: 'Sin plan por ahora' },
    ...plans.filter((plan) => plan.active).map((plan) => ({ value: plan.id, label: `${plan.name} · ${describePlan(plan)}` })),
  ]
  const hasPlan = values.plan_id !== NO_PLAN

  const save = form.submit((data) => mutation.mutateAsync({ profileId: profile.id, ...data }).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Aprobar como alumna"
      description={`${profile.full_name ?? profile.email} podrá reservar clases. Puedes asignarle su plan ahora mismo.`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            {hasPlan ? 'Aprobar y asignar plan' : 'Aprobar'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <Field label="Plan inicial" hint="Opcional. Sin plan no podrá reservar hasta que se lo asignes.">
          <Select options={options} value={values.plan_id} onValueChange={(v) => setValue('plan_id', v)} />
        </Field>
        {hasPlan && (
          <Field label="El plan inicia el" error={errors.starts_on} required>
            <Input type="date" value={values.starts_on} onChange={(e) => setValue('starts_on', e.target.value)} />
          </Field>
        )}
      </form>
    </Dialog>
  )
}
