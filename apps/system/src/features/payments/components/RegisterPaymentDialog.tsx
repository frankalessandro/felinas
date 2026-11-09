import { FileText, Paperclip, TriangleAlert, X } from 'lucide-react'
import { useRef, useState } from 'react'
import { Button, Dialog, Field, Input, Spinner, Textarea } from '@/components/ui'
import { useZodForm } from '@/hooks/useZodForm'
import { cn } from '@/lib/cn'
import { toDateKey } from '@/lib/dates'
import { formatCOP, formatMoneyInput } from '@/lib/money'
import { PAYMENT_METHODS, RECEIPT_ACCEPT } from '../constants'
import { useRegisterPayment } from '../hooks/usePaymentMutations'
import { registerPaymentSchema, validateReceiptFile } from '../schemas'
import type { RegisterPaymentValues } from '../schemas'
import type { PaymentMethod } from '../types'
import { METHOD_ICON } from './PaymentMethodChip'

interface RegisterPaymentDialogProps {
  studentId: string
  studentName: string
  /** Plan al que se abona; `null` registra un pago suelto que no descuenta ningún saldo. */
  studentPlanId: string | null
  planName?: string | null
  /** Valor sugerido: el saldo pendiente o el precio del plan recién renovado. */
  suggestedAmount: number | null
  onClose: () => void
}

const FORM_ID = 'register-payment-form'
const MAX_MB_LABEL = '5 MB'

const STAGE_LABEL = { uploading: 'Subiendo comprobante…', saving: 'Guardando pago…' } as const

function formatSize(bytes: number): string {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

interface MethodChipsProps {
  value: PaymentMethod
  onChange: (method: PaymentMethod) => void
}

function MethodChips({ value, onChange }: MethodChipsProps) {
  return (
    <div role="radiogroup" aria-label="Método de pago" className="grid grid-cols-3 gap-2">
      {PAYMENT_METHODS.map((method) => {
        const selected = method.value === value
        const Icon = METHOD_ICON[method.value]
        return (
          <button
            key={method.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(method.value)}
            className={cn(
              'flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border px-2 text-xs font-semibold transition-colors active:scale-[.98]',
              selected ? 'border-rosa bg-rosa-soft text-fg ring-1 ring-rosa/40' : 'border-line bg-surface-2 text-fg-muted hover:border-line-strong hover:text-fg',
            )}
          >
            <Icon className={cn('size-5', selected && 'text-rosa-hover')} aria-hidden />
            {method.label}
          </button>
        )
      })}
    </div>
  )
}

export function RegisterPaymentDialog({ studentId, studentName, studentPlanId, planName, suggestedAmount, onClose }: RegisterPaymentDialogProps) {
  const mutation = useRegisterPayment()
  const initial: RegisterPaymentValues = {
    amount: suggestedAmount && suggestedAmount > 0 ? formatMoneyInput(String(suggestedAmount)) : '',
    method: 'cash',
    paid_on: toDateKey(new Date()),
    reference: '',
    notes: '',
  }
  const form = useZodForm(registerPaymentSchema, initial)
  const { values, errors, setValue } = form
  const [receipt, setReceipt] = useState<File | null>(null)
  const [receiptError, setReceiptError] = useState<string | null>(null)
  const [stage, setStage] = useState<keyof typeof STAGE_LABEL | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  function pickReceipt(file: File | undefined) {
    if (!file) return
    const problem = validateReceiptFile(file)
    setReceiptError(problem)
    setReceipt(problem ? null : file)
  }

  function clearReceipt() {
    setReceipt(null)
    setReceiptError(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  const save = form.submit((data) =>
    mutation.mutateAsync({ studentId, studentPlanId, data, receipt, onStage: setStage }).then(onClose, () => setStage(null)),
  )

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && !mutation.isPending && onClose()}
      title="Registrar pago"
      description={`${studentName}${planName ? ` · ${planName}` : ''}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={mutation.isPending}>
            Cancelar
          </Button>
          <Button type="submit" form={FORM_ID} loading={mutation.isPending}>
            {stage ? STAGE_LABEL[stage] : 'Registrar pago'}
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={save} noValidate className="flex flex-col gap-4">
        {!studentPlanId && (
          <p className="flex items-start gap-2 rounded-xl border border-warn/30 bg-warn-soft p-3 text-xs text-warn">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            Este pago no está ligado a un plan: no descuenta ningún saldo.
          </p>
        )}

        <Field label="Valor (COP)" error={errors.amount} required>
          <Input
            inputMode="numeric"
            autoComplete="off"
            value={values.amount}
            onChange={(e) => setValue('amount', formatMoneyInput(e.target.value))}
            placeholder="120.000"
            className="h-14 font-display text-3xl font-bold tabular-nums text-ambar"
          />
        </Field>
        {suggestedAmount !== null && suggestedAmount > 0 && values.amount !== formatMoneyInput(String(suggestedAmount)) && (
          <button
            type="button"
            onClick={() => setValue('amount', formatMoneyInput(String(suggestedAmount)))}
            className="-mt-2 min-h-11 w-fit rounded-xl px-1 text-left text-xs font-semibold text-rosa-hover hover:underline"
          >
            Usar el valor sugerido: {formatCOP(suggestedAmount)}
          </button>
        )}

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Método</span>
          <MethodChips value={values.method} onChange={(method) => setValue('method', method)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fecha del pago" error={errors.paid_on} required>
            <Input type="date" value={values.paid_on} onChange={(e) => setValue('paid_on', e.target.value)} />
          </Field>
          <Field label="Referencia" error={errors.reference} hint="Opcional. Ej. # de transferencia.">
            <Input value={values.reference} onChange={(e) => setValue('reference', e.target.value)} maxLength={80} />
          </Field>
        </div>

        <Field
          label="Nota"
          error={errors.notes}
          hint={
            <span className="text-warn">La alumna puede ver esta nota. No escribas comentarios internos.</span>
          }
        >
          <Textarea rows={2} value={values.notes} onChange={(e) => setValue('notes', e.target.value)} maxLength={300} />
        </Field>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Comprobante</span>
          <input
            ref={fileInput}
            type="file"
            accept={RECEIPT_ACCEPT}
            className="sr-only"
            aria-label="Adjuntar comprobante"
            onChange={(e) => pickReceipt(e.target.files?.[0])}
          />
          {receipt ? (
            <div className="flex min-h-11 items-center gap-3 rounded-xl border border-line bg-surface-2 px-3 py-2">
              {stage === 'uploading' ? <Spinner size="sm" /> : <FileText className="size-5 shrink-0 text-rosa-hover" aria-hidden />}
              <span className="min-w-0 flex-1 truncate text-sm">{receipt.name}</span>
              <span className="shrink-0 text-xs text-fg-muted">{formatSize(receipt.size)}</span>
              <button
                type="button"
                onClick={clearReceipt}
                disabled={mutation.isPending}
                aria-label="Quitar comprobante"
                className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-xl text-fg-muted hover:text-fg disabled:opacity-40"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => fileInput.current?.click()} className="justify-start">
              <Paperclip className="size-4" aria-hidden /> Adjuntar foto o PDF
            </Button>
          )}
          {stage === 'uploading' && (
            <div role="progressbar" aria-label="Subiendo comprobante" className="h-1 overflow-hidden rounded-full bg-surface-3">
              <div className="h-full w-1/3 animate-shimmer rounded-full bg-gradient-felinas" />
            </div>
          )}
          {receiptError ? (
            <p role="alert" className="text-xs font-medium text-danger">
              {receiptError}
            </p>
          ) : (
            <p className="text-xs text-fg-muted">Opcional. JPG, PNG, WEBP o PDF de hasta {MAX_MB_LABEL}. Solo lo ve la administración.</p>
          )}
        </div>
      </form>
    </Dialog>
  )
}
