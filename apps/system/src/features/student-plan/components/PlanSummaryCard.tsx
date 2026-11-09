import { CalendarClock, Snowflake, TicketCheck } from 'lucide-react'
import { IconTile, Meter, Stamp } from '@/components/brand'
import type { StampTone } from '@/components/brand'
import { Card } from '@/components/ui'
import { cn } from '@/lib/cn'
import { formatters, fromDateKey } from '@/lib/dates'
import type { QuotaUsage } from '@/features/bookings/quota'
import { formatCop } from '../payment'
import {
  EXPIRING_DAYS_THRESHOLD,
  LOW_CLASSES_THRESHOLD,
  PLAN_TYPE_LABEL,
  describeDaysLeft,
  getBookableClasses,
  getPlanMonthName,
} from '../plans'
import type { PlanPayment, StudentPlan } from '../types'
import { AllowedTypeChips } from './AllowedTypeChips'
import { CategoryQuotaBars } from './CategoryQuotaBars'

interface PlanSummaryCardProps {
  plan: StudentPlan
  /** Clases futuras ya reservadas con este plan. */
  reserved?: number
  /** `detailed` agrega los estilos permitidos (pantalla Mi plan). */
  variant?: 'compact' | 'detailed'
  /** Uso por categoría (solo planes con cupos). */
  quotaUsage?: QuotaUsage[]
}

interface PlanMeter {
  value: string
  caption: string
  progress: { value: number; max: number } | null
  isLow: boolean
  isEmpty: boolean
}

function getMeter(plan: StudentPlan): PlanMeter {
  if (plan.type === 'package' && plan.classesRemaining !== null) {
    return {
      value: String(plan.classesRemaining),
      caption: plan.classesRemaining === 1 ? 'clase disponible' : 'clases disponibles',
      progress: plan.classesTotal ? { value: plan.classesRemaining, max: plan.classesTotal } : null,
      isLow: plan.classesRemaining <= LOW_CLASSES_THRESHOLD,
      isEmpty: plan.classesRemaining === 0,
    }
  }
  const used = plan.bookedThisWeek ?? 0
  if (plan.weeklyLimit === null) {
    return { value: String(used), caption: 'reservadas esta semana · sin límite', progress: null, isLow: false, isEmpty: false }
  }
  return {
    value: `${used}/${plan.weeklyLimit}`,
    caption: 'clases reservadas esta semana',
    progress: { value: used, max: plan.weeklyLimit },
    isLow: false,
    isEmpty: false,
  }
}

interface PaymentStamp {
  label: string
  tone: StampTone
  detail: string | null
}

function getPaymentStamp(payment: PlanPayment): PaymentStamp {
  switch (payment.status) {
    case 'paid':
      return { label: 'Pagado', tone: 'ok', detail: null }
    case 'partial':
      return { label: 'Abono', tone: 'warn', detail: `Debes ${formatCop(payment.balance)}` }
    case 'pending':
      return { label: 'Pendiente', tone: 'danger', detail: `Por pagar ${formatCop(payment.balance)}` }
    case 'free':
      return { label: 'Sin costo', tone: 'muted', detail: null }
  }
}

/** Tarjeta del plan: anillo con el saldo de clases, estado de pago, cupos por categoría y vencimiento. */
export function PlanSummaryCard({ plan, reserved = 0, variant = 'compact', quotaUsage = [] }: PlanSummaryCardProps) {
  const meter = getMeter(plan)
  const isDetailed = variant === 'detailed'
  const expiresSoon = plan.daysToExpire <= EXPIRING_DAYS_THRESHOLD
  const bookable = plan.type === 'package' ? getBookableClasses(plan, reserved) : null
  const stamp = plan.payment ? getPaymentStamp(plan.payment) : null
  const meterTone = meter.isEmpty ? 'danger' : meter.isLow ? 'dorado' : 'rosa'
  const month = getPlanMonthName(plan)
  const ringSize = isDetailed ? 112 : 92
  const meterLabel = plan.type === 'package' ? 'Clases disponibles del paquete' : 'Clases reservadas esta semana'

  return (
    <Card className={cn('flex flex-col gap-4 p-5', plan.isFrozen && 'saturate-50')}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={plan.isFrozen ? Snowflake : TicketCheck} tone={plan.isFrozen ? 'cian' : plan.isPrivate ? 'ambar' : 'rosa'} />
          <div className="min-w-0">
            <h3 className="break-words font-display text-base font-bold leading-tight">{plan.name}</h3>
            <p className="text-xs text-fg-muted">
              {PLAN_TYPE_LABEL[plan.type]}
              {plan.isPrivate ? ' · Personalizada' : ''}
              {plan.validity === 'calendar_month' ? ` · ${month}` : ''}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {plan.isFrozen && <Stamp tone="info">Congelado</Stamp>}
          {stamp && <Stamp tone={stamp.tone}>{stamp.label}</Stamp>}
        </div>
      </div>

      <div className="flex items-center gap-5">
        {meter.progress ? (
          <Meter variant="ring" size={ringSize} value={meter.progress.value} max={meter.progress.max} tone={meterTone} label={meterLabel}>
            <span className="font-display text-2xl font-bold tabular-nums">{meter.value}</span>
          </Meter>
        ) : (
          <span className="font-display text-4xl font-bold tabular-nums">{meter.value}</span>
        )}
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-sm font-medium">
            {meter.caption}
            {plan.type === 'package' && plan.classesTotal !== null && <span className="text-fg-subtle"> · de {plan.classesTotal}</span>}
          </p>
          {plan.type === 'package' && reserved > 0 && (
            <p className="text-sm text-fg-muted">
              <span className="font-semibold text-fg">{reserved}</span> {reserved === 1 ? 'reservada' : 'reservadas'} · puedes reservar{' '}
              <span className="font-semibold text-fg">{bookable}</span> más.
            </p>
          )}
          {stamp?.detail && <p className="text-xs font-semibold text-fg-muted">{stamp.detail}</p>}
        </div>
      </div>

      <CategoryQuotaBars usage={quotaUsage} />

      {isDetailed && (
        <div className="flex flex-col gap-2 border-t border-line pt-4">
          <p className="text-sm font-semibold text-fg-muted">Estilos que puedes reservar</p>
          <AllowedTypeChips types={plan.classTypes} />
        </div>
      )}

      <p className={cn('flex items-center gap-2 border-t border-line pt-4 text-sm', expiresSoon ? 'font-semibold text-ambar' : 'text-fg-muted')}>
        <CalendarClock className="size-4 shrink-0" aria-hidden />
        <span>
          {plan.validity === 'calendar_month' ? 'Vence el último día del mes: ' : 'Vence el '}
          {formatters.dayMonth(fromDateKey(plan.expiresOn))}
          <span className="font-normal text-fg-subtle"> · {plan.daysToExpire <= 0 ? 'último día' : describeDaysLeft(plan.daysToExpire)}</span>
        </span>
      </p>
    </Card>
  )
}
