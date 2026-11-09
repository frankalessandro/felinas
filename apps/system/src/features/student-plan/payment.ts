import type { BadgeTone } from '@/components/ui'
import type { PlanPayment } from './types'

const copFormatter = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export function formatCop(amount: number): string {
  return copFormatter.format(amount)
}

export interface PaymentDisplay {
  label: string
  tone: BadgeTone
}

export function getPaymentDisplay(payment: PlanPayment): PaymentDisplay {
  switch (payment.status) {
    case 'paid':
      return { label: 'Pagado', tone: 'ok' }
    case 'partial':
      return { label: `Abono parcial · debes ${formatCop(payment.balance)}`, tone: 'warn' }
    case 'pending':
      return { label: 'Pendiente de pago', tone: 'danger' }
    case 'free':
      return { label: 'Sin costo', tone: 'neutral' }
  }
}
