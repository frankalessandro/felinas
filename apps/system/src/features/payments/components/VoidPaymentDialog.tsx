import { Stamp } from '@/components/brand'
import { Button, Dialog, Field, Textarea } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { formatCOP } from '@/lib/money'
import { useVoidPayment } from '../hooks/usePaymentMutations'
import { voidPaymentSchema } from '../schemas'
import type { Payment } from '../types'

interface VoidPaymentDialogProps {
  payment: Payment
  onClose: () => void
}

const FORM_ID = 'void-payment-form'

/** Anular exige motivo: el pago no se borra, queda tachado en el historial. */
export function VoidPaymentDialog({ payment, onClose }: VoidPaymentDialogProps) {
  const mutation = useVoidPayment()
  const form = useZodForm(voidPaymentSchema, { reason: '' })
  const { values, errors, setValue } = form
  const save = form.submit((data) => mutation.mutateAsync({ paymentId: payment.id, reason: data.reason }).then(onClose, () => undefined))

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={`¿Anular el pago de ${formatCOP(payment.amount)}?`}
      description="El saldo del plan se recalcula. El pago queda en el historial como anulado."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Volver
          </Button>
          <Button type="submit" form={FORM_ID} variant="danger" loading={mutation.isPending}>
            Anular pago
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-danger/30 bg-danger-soft p-4">
          <span className="font-display text-2xl font-bold tabular-nums text-danger line-through">{formatCOP(payment.amount)}</span>
          <Stamp tone="danger">
            Anulado
          </Stamp>
        </div>
        <Field label="Motivo" error={errors.reason} required>
          <Textarea rows={2} value={values.reason} onChange={(e) => setValue('reason', e.target.value)} maxLength={200} placeholder="Ej. Registré el valor equivocado" />
        </Field>
      </form>
    </Dialog>
  )
}
