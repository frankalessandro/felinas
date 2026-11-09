import { Banknote, CreditCard, Ellipsis, Landmark, Smartphone } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { getMethodLabel } from '../constants'
import type { PaymentMethod } from '../types'

export const METHOD_ICON: Record<PaymentMethod, LucideIcon> = {
  cash: Banknote,
  nequi: Smartphone,
  daviplata: Smartphone,
  transfer: Landmark,
  card: CreditCard,
  other: Ellipsis,
}

/** Método de pago como píldora con ícono (para listas de pagos). */
export function PaymentMethodChip({ method }: { method: PaymentMethod }) {
  const Icon = METHOD_ICON[method]
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-3 px-2.5 py-1 text-xs font-semibold text-fg-muted">
      <Icon className="size-3.5" aria-hidden />
      {getMethodLabel(method)}
    </span>
  )
}
