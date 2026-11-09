import { differenceInCalendarDays } from 'date-fns'
import { ChevronDown, Pencil, RefreshCw, Snowflake, Wallet } from 'lucide-react'
import { useState } from 'react'
import { Badge, Button, ProgressBar } from '@/components/ui'
import type { BadgeTone } from '@/components/ui'
import { toPaymentStatus } from '@/features/payments/constants'
import { PaymentList } from '@/features/payments/components/PaymentList'
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge'
import type { Payment } from '@/features/payments/types'
import { cn } from '@/lib/cn'
import { academyToday, formatters, fromDateKey, toAcademyTime } from '@/lib/dates'
import { formatCOPOr } from '@/lib/money'
import { describeDaysToExpire, describeRemaining, formatDateKey } from '../lib'
import type { StudentPlanDetail } from '../types'

const STATUS_BADGE: Record<string, { label: string; tone: BadgeTone }> = {
  active: { label: 'Vigente', tone: 'ok' },
  expired: { label: 'Vencido', tone: 'neutral' },
  cancelled: { label: 'Cancelado', tone: 'danger' },
}

interface StudentPlanCardProps {
  plan: StudentPlanDetail
  payments: Payment[]
  /** Solo el plan más reciente ofrece "Renovar" para no llenar la lista de botones repetidos. */
  canRenew: boolean
  renewing: boolean
  onPay: () => void
  onSetPrice: () => void
  onToggleFreeze: () => void
  onRenew: () => void
  onCancel: () => void
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className="text-xs font-medium text-fg-subtle">{label}</dt>
      <dd className={cn('font-display text-lg font-bold tabular-nums', className)}>{value}</dd>
    </div>
  )
}

export function StudentPlanCard({ plan, payments, canRenew, renewing, onPay, onSetPrice, onToggleFreeze, onRenew, onCancel }: StudentPlanCardProps) {
  const [showPayments, setShowPayments] = useState(false)
  const badge = STATUS_BADGE[plan.effective_status ?? 'expired'] ?? STATUS_BADGE.expired
  const isActive = plan.effective_status === 'active'
  const isCancelled = plan.effective_status === 'cancelled'
  const owes = plan.balance !== null && plan.balance > 0
  const frozenSince = plan.is_frozen && plan.frozen_at ? toAcademyTime(plan.frozen_at) : null
  const frozenSoFar = frozenSince ? Math.max(0, differenceInCalendarDays(academyToday(), frozenSince)) : 0
  const showBar = plan.plan_type === 'package' && plan.classes_total

  return (
    <div
      className={cn('relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-5 pl-6 shadow-card', isCancelled && 'opacity-70')}
    >
      <span
        aria-hidden
        className="absolute inset-y-0 left-0 w-1.5"
        style={{ background: isCancelled ? 'var(--color-line-strong)' : plan.is_private ? 'var(--color-dorado)' : 'var(--color-rosa)' }}
      />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-lg font-bold leading-tight">{plan.plan_name}</h3>
            <Badge tone={badge?.tone}>{badge?.label}</Badge>
            {plan.is_private && <Badge tone="dorado">Personalizada</Badge>}
            <PaymentStatusBadge status={toPaymentStatus(plan.payment_status)} />
          </div>
          <p className="text-xs text-fg-muted">
            {plan.starts_on ? formatters.monthYear(fromDateKey(plan.starts_on)) : ''} · {plan.starts_on && formatDateKey(plan.starts_on)} →{' '}
            {plan.expires_on && formatDateKey(plan.expires_on)}
            {isActive && ` · ${describeDaysToExpire(plan.days_to_expire)}`}
          </p>
        </div>
      </div>

      {frozenSince && (
        <div role="status" className="flex items-start gap-3 rounded-xl border border-rosa/30 bg-rosa-soft p-3 text-sm">
          <Snowflake className="mt-0.5 size-4 shrink-0 text-rosa-hover" aria-hidden />
          <p>
            Congelado desde <span className="font-semibold">{formatters.shortDate(frozenSince)}</span> ({frozenSoFar} {frozenSoFar === 1 ? 'día' : 'días'}). Al
            descongelar, el vencimiento se corre esos días.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {showBar && (
          <ProgressBar
            label="Clases restantes"
            value={plan.classes_remaining ?? 0}
            max={plan.classes_total ?? 1}
            tone={(plan.classes_remaining ?? 0) <= 2 ? 'warn' : 'rosa'}
          />
        )}
        <p className="text-xs text-fg-muted">
          {plan.plan_type === 'package'
            ? `${plan.classes_used ?? 0} de ${plan.classes_total ?? 0} clases usadas`
            : describeRemaining(plan)}
          {plan.frozen_days ? ` · ${plan.frozen_days} días congelados en total` : ''}
        </p>
      </div>

      <dl className="grid grid-cols-3 gap-3 rounded-xl border border-line bg-surface-2 p-3">
        <Stat label="Valor" value={formatCOPOr(plan.price, 'Sin valor')} />
        <Stat label="Pagado" value={formatCOPOr(plan.paid, '$0')} className="text-dorado" />
        <Stat label="Saldo" value={formatCOPOr(plan.balance, '—')} className={owes ? 'text-warn' : 'text-ok'} />
      </dl>
      {plan.discount_note && <p className="-mt-2 text-xs text-fg-muted">Descuento: {plan.discount_note}</p>}

      {!isCancelled && (
        <div className="flex flex-wrap gap-2">
          <Button variant={owes ? 'primary' : 'secondary'} onClick={onPay}>
            <Wallet className="size-4" aria-hidden /> Registrar pago
          </Button>
          <Button variant="secondary" onClick={onSetPrice}>
            <Pencil className="size-4" aria-hidden /> Valor / descuento
          </Button>
          {canRenew && (
            <Button variant="outline" loading={renewing} onClick={onRenew}>
              <RefreshCw className="size-4" aria-hidden /> Renovar
            </Button>
          )}
          {isActive && (
            <Button variant="secondary" onClick={onToggleFreeze}>
              <Snowflake className="size-4" aria-hidden /> {plan.is_frozen ? 'Descongelar' : 'Congelar'}
            </Button>
          )}
          {isActive && (
            <Button variant="danger" onClick={onCancel}>
              Cancelar plan
            </Button>
          )}
        </div>
      )}

      <div className="border-t border-line pt-3">
        <button
          type="button"
          aria-expanded={showPayments}
          onClick={() => setShowPayments((open) => !open)}
          className="flex min-h-11 w-full items-center justify-between gap-2 text-left text-sm font-semibold text-fg-muted hover:text-fg"
        >
          Pagos ({payments.length})
          <ChevronDown className={cn('size-4 transition-transform', showPayments && 'rotate-180')} aria-hidden />
        </button>
        {showPayments && (
          <div className="pt-2">
            <PaymentList payments={payments} />
          </div>
        )}
      </div>
    </div>
  )
}
