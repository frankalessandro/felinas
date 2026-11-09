import { Ban, Receipt } from 'lucide-react'
import { useState } from 'react'
import { Stamp } from '@/components/brand'
import { Button, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatters, fromDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import type { Payment } from '../types'
import { PaymentMethodChip } from './PaymentMethodChip'
import { ReceiptDialog } from './ReceiptDialog'
import { VoidPaymentDialog } from './VoidPaymentDialog'

interface PaymentListProps {
  payments: Payment[]
  /** Solo lectura oculta el botón de anular. */
  canVoid?: boolean
}

/** Pagos de un plan (o sueltos): monto en ámbar, método con ícono y acceso al comprobante. */
export function PaymentList({ payments, canVoid = true }: PaymentListProps) {
  const [voiding, setVoiding] = useState<Payment | null>(null)
  const [receiptPath, setReceiptPath] = useState<string | null>(null)

  if (payments.length === 0) return <EmptyState illustration="wallet" title="Aún no hay pagos" description="Cuando registres un pago aparecerá aquí." className="py-7" />

  return (
    <>
      <ul className="flex flex-col gap-2">
        {payments.map((payment) => {
          const isVoided = payment.voided_at !== null
          return (
            <li key={payment.id} className="flex flex-col gap-1.5 rounded-xl border border-line bg-surface-2/50 p-3">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className={cn('font-display text-lg font-bold tabular-nums text-ambar', isVoided && 'text-fg-subtle line-through')}>
                  {formatCOP(payment.amount)}
                </span>
                <PaymentMethodChip method={payment.method} />
                {isVoided && (
                  <Stamp tone="danger">
                    Anulado
                  </Stamp>
                )}
                <span className="text-xs text-fg-muted">{formatters.shortDate(fromDateKey(payment.paid_on))}</span>
                <div className="ml-auto flex items-center gap-1">
                  {payment.receipt_path && (
                    <Button variant="ghost" size="sm" className="min-h-11" onClick={() => setReceiptPath(payment.receipt_path)}>
                      <Receipt className="size-4" aria-hidden /> Comprobante
                    </Button>
                  )}
                  {canVoid && !isVoided && (
                    <Button variant="ghost" size="sm" className="min-h-11 text-danger hover:text-danger" onClick={() => setVoiding(payment)}>
                      <Ban className="size-4" aria-hidden /> Anular
                    </Button>
                  )}
                </div>
              </div>
              {payment.reference && <p className="text-xs text-fg-muted">Ref. {payment.reference}</p>}
              {payment.notes && <p className="text-xs text-fg-muted">{payment.notes}</p>}
              {isVoided && payment.void_reason && <p className="text-xs text-danger">Motivo: {payment.void_reason}</p>}
            </li>
          )
        })}
      </ul>
      {voiding && <VoidPaymentDialog payment={voiding} onClose={() => setVoiding(null)} />}
      {receiptPath && <ReceiptDialog path={receiptPath} onClose={() => setReceiptPath(null)} />}
    </>
  )
}
