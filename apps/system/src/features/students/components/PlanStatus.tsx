import { Badge, ProgressBar } from '@/components/ui'
import type { BadgeTone } from '@/components/ui'
import { describeDaysToExpire, describeRemaining, getPlanWarnings } from '../lib'
import type { PlanWarning } from '../lib'
import type { PlanSummary } from '../types'

const WARNING_LABEL: Record<PlanWarning, { label: string; tone: BadgeTone }> = {
  'no-plan': { label: 'Sin plan', tone: 'danger' },
  expiring: { label: 'Por vencer', tone: 'warn' },
  'low-classes': { label: 'Pocas clases', tone: 'warn' },
}

export function PlanWarningBadges({ plan }: { plan: PlanSummary | null }) {
  const warnings = getPlanWarnings(plan)
  if (warnings.length === 0) return null
  return (
    <>
      {warnings.map((warning) => (
        <Badge key={warning} tone={WARNING_LABEL[warning].tone}>
          {WARNING_LABEL[warning].label}
        </Badge>
      ))}
    </>
  )
}

/** Resumen compacto del plan vigente: nombre, saldo y vencimiento. */
export function ActivePlanSummary({ plan }: { plan: PlanSummary | null }) {
  if (!plan) return <span className="text-sm text-fg-subtle">Sin plan vigente</span>
  const showBar = plan.plan_type === 'package' && plan.classes_total
  return (
    <div className="flex min-w-0 flex-col gap-1.5">
      <p className="truncate text-sm font-semibold text-fg">{plan.plan_name}</p>
      {showBar && (
        <ProgressBar
          label="Clases restantes"
          value={plan.classes_remaining ?? 0}
          max={plan.classes_total ?? 1}
          tone={(plan.classes_remaining ?? 0) <= 2 ? 'warn' : 'rosa'}
        />
      )}
      <p className="text-xs text-fg-muted">
        {describeRemaining(plan)} · {describeDaysToExpire(plan.days_to_expire)}
      </p>
    </div>
  )
}
