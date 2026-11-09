import { Link } from '@tanstack/react-router'
import { Snowflake } from 'lucide-react'
import { Meter, Stamp } from '@/components/brand'
import type { StampTone } from '@/components/brand'
import { Avatar } from '@/components/ui'
import type { BadgeTone } from '@/components/ui'
import { PaymentStatusBadge } from '@/features/payments/components/PaymentStatusBadge'
import { cn } from '@/lib/cn'
import { daysUntil, formatters, fromDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import { BUCKET_META, describeClasses, describeLastAttended } from '../rowMeta'
import type { SubscriptionRow } from '../types'

export function StudentCell({ row }: { row: SubscriptionRow }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={row.fullName} src={row.avatarUrl} size="md" />
      <div className="flex min-w-0 flex-col">
        <Link
          to="/admin/students/$studentId"
          params={{ studentId: row.studentId }}
          search={{ tab: 'plans' }}
          className="truncate font-display text-sm font-bold leading-tight hover:text-rosa-hover"
        >
          {row.fullName}
        </Link>
        <span className="truncate text-xs text-fg-muted">{describeLastAttended(row.lastAttendedAt)}</span>
      </div>
    </div>
  )
}

/** Clases restantes como barra: llena = disponibles; ámbar cuando queda una o ninguna. */
function ClassMeter({ remaining, total }: { remaining: number; total: number }) {
  return (
    <Meter
      variant="bar"
      value={remaining}
      max={total}
      tone={remaining <= 1 ? 'warn' : 'rosa'}
      label={`${remaining} de ${total} clases restantes`}
      className="h-2"
    />
  )
}

export function PlanCell({ row }: { row: SubscriptionRow }) {
  if (!row.planName) {
    return (
      <p className="text-sm text-fg-muted">
        {row.prevPlanName ? (
          <>
            Mes anterior: <span className="font-semibold text-fg">{row.prevPlanName}</span>
          </>
        ) : (
          'Sin plan'
        )}
      </p>
    )
  }
  const remaining = row.classesRemaining ?? 0
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="truncate text-sm font-semibold">{row.planName}</p>
      {row.classesTotal !== null ? (
        <>
          <ClassMeter remaining={remaining} total={row.classesTotal} />
          <p className="text-xs text-fg-muted">{describeClasses(row)}</p>
        </>
      ) : (
        <p className="text-xs text-fg-muted">Mensualidad</p>
      )}
    </div>
  )
}

export function ExpiryCell({ row }: { row: SubscriptionRow }) {
  if (!row.expiresOn) return <span className="text-sm text-fg-subtle">—</span>
  const days = daysUntil(fromDateKey(row.expiresOn))
  const tone = days < 0 ? 'text-danger' : days <= 5 ? 'text-warn' : 'text-fg-muted'
  const hint = days < 0 ? 'Vencido' : days === 0 ? 'Vence hoy' : days === 1 ? 'Vence mañana' : `en ${days} días`
  return (
    <div className="flex flex-col">
      <span className="text-sm font-semibold">{formatters.dayMonth(fromDateKey(row.expiresOn))}</span>
      <span className={cn('text-xs font-semibold', tone)}>{hint}</span>
    </div>
  )
}

export function MoneyCell({ row }: { row: SubscriptionRow }) {
  if (row.studentPlanId === null) return <span className="text-sm text-fg-subtle">—</span>
  const owes = row.balance !== null && row.balance > 0
  return (
    <div className="flex flex-col items-start gap-1.5">
      <PaymentStatusBadge status={row.paymentStatus} />
      {owes && row.balance !== null && <span className="font-display text-sm font-bold text-ambar">Debe {formatCOP(row.balance)}</span>}
      {!owes && row.paid > 0 && <span className="text-xs text-fg-muted">Pagó {formatCOP(row.paid)}</span>}
    </div>
  )
}

const STATUS_TONE: Record<BadgeTone, StampTone> = {
  neutral: 'muted',
  rosa: 'rosa',
  dorado: 'dorado',
  ok: 'ok',
  warn: 'warn',
  danger: 'danger',
}

export function StatusBadges({ row }: { row: SubscriptionRow }) {
  const meta = BUCKET_META[row.bucket]
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Stamp tone={STATUS_TONE[meta.tone]}>{meta.label}</Stamp>
      {row.isFrozen && (
        <Stamp tone="info">
          <Snowflake className="size-3" aria-hidden /> Congelado
        </Stamp>
      )}
    </div>
  )
}
