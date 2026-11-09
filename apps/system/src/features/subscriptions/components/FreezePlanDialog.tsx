import { useQuery } from '@tanstack/react-query'
import { addDays, differenceInCalendarDays } from 'date-fns'
import { Snowflake } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Button, Dialog, Field, Textarea } from '@/components/ui'
import { academyToday, formatters, fromDateKey, toAcademyTime } from '@/lib/dates'
import { useFreezePlan, useUnfreezePlan } from '../hooks/useSubscriptionMutations'
import { studentPlanRowQuery } from '../queries'

interface FreezePlanDialogProps {
  mode: 'freeze' | 'unfreeze'
  studentPlanId: string
  studentName: string
  onClose: () => void
}

const REASON_MAX = 200
const FORM_ID = 'freeze-plan-form'

function FreezeForm({ studentPlanId, onClose }: Pick<FreezePlanDialogProps, 'studentPlanId' | 'onClose'>) {
  const mutation = useFreezePlan()
  const [reason, setReason] = useState('')
  const trimmed = reason.trim()

  return (
    <>
      <form
        id={FORM_ID}
        onSubmit={(event) => {
          event.preventDefault()
          mutation.mutateAsync({ studentPlanId, reason: trimmed === '' ? null : trimmed }).then(onClose, () => undefined)
        }}
        className="flex flex-col gap-4"
      >
        <p className="text-sm text-fg-muted">
          Mientras el plan esté congelado no podrá reservar clases (las reservas que ya tiene se conservan). Al descongelarlo, el vencimiento se
          corre los días que estuvo congelado.
        </p>
        <Field label="Motivo" hint="Opcional. Ej. viaje, lesión.">
          <Textarea rows={2} value={reason} onChange={(e) => setReason(e.target.value)} maxLength={REASON_MAX} />
        </Field>
      </form>
      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
          <Snowflake className="size-4" aria-hidden /> Congelar plan
        </Button>
      </div>
    </>
  )
}

function UnfreezeContent({ studentPlanId, onClose }: Pick<FreezePlanDialogProps, 'studentPlanId' | 'onClose'>) {
  const query = useQuery(studentPlanRowQuery(studentPlanId))
  const mutation = useUnfreezePlan()
  const plan = query.data

  const frozenAt = plan?.frozen_at ? toAcademyTime(plan.frozen_at) : null
  const frozenDays = frozenAt ? Math.max(0, differenceInCalendarDays(academyToday(), frozenAt)) : 0
  const newExpiry = plan ? addDays(fromDateKey(plan.expires_on), frozenDays) : null

  return (
    <AsyncContent isLoading={query.isLoading} error={query.error} onRetry={() => query.refetch()}>
      {plan && frozenAt && newExpiry && (
        <div className="flex flex-col gap-4">
          <dl className="grid gap-3 rounded-xl border border-line bg-surface-2 p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-fg-muted">Congelado desde</dt>
              <dd className="font-semibold">{formatters.shortDate(frozenAt)}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Días congelados</dt>
              <dd className="font-semibold">{frozenDays}</dd>
            </div>
            <div>
              <dt className="text-xs text-fg-muted">Nuevo vencimiento</dt>
              <dd className="font-semibold text-ok">{formatters.shortDate(newExpiry)}</dd>
            </div>
          </dl>
          <p className="text-xs text-fg-muted">
            Al descongelar se suman los días congelados a la fecha de vencimiento ({formatters.shortDate(fromDateKey(plan.expires_on))} hoy).
          </p>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button variant="ghost" onClick={onClose}>
              Volver
            </Button>
            <Button loading={mutation.isPending} onClick={() => mutation.mutateAsync(studentPlanId).then(onClose, () => undefined)}>
              Descongelar plan
            </Button>
          </div>
        </div>
      )}
      {plan && !frozenAt && <p className="text-sm text-fg-muted">Este plan ya no está congelado.</p>}
    </AsyncContent>
  )
}

export function FreezePlanDialog({ mode, studentPlanId, studentName, onClose }: FreezePlanDialogProps) {
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={mode === 'freeze' ? 'Congelar plan' : 'Descongelar plan'}
      description={studentName}
    >
      {mode === 'freeze' ? (
        <FreezeForm studentPlanId={studentPlanId} onClose={onClose} />
      ) : (
        <UnfreezeContent studentPlanId={studentPlanId} onClose={onClose} />
      )}
    </Dialog>
  )
}
