import { Stamp } from '@/components/brand'
import type { StampTone } from '@/components/brand'
import { PAYMENT_STATUS_LABEL } from '../constants'
import type { PaymentStatus } from '../types'

const STAMP_TONE: Record<'ok' | 'warn' | 'danger' | 'neutral', StampTone> = { ok: 'ok', warn: 'warn', danger: 'danger', neutral: 'muted' }

/** Estado de pago como etiqueta con punto (Pagado, Abono, Sin pagar). */
export function PaymentStatusBadge({ status }: { status: PaymentStatus | null }) {
  if (!status) return null
  const { label, tone } = PAYMENT_STATUS_LABEL[status]
  return (
    <Stamp tone={STAMP_TONE[tone]}>
      {label}
    </Stamp>
  )
}
