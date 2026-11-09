import { History } from 'lucide-react'
import { IconTile, Stamp } from '@/components/brand'
import { formatters, fromDateKey } from '@/lib/dates'
import { PLAN_TYPE_LABEL } from '../plans'
import type { StudentPlan } from '../types'

function describeOutcome(plan: StudentPlan): { label: string; tone: 'muted' | 'danger' } {
  if (plan.status === 'cancelled') return { label: 'Cancelado', tone: 'danger' }
  return { label: 'Vencido', tone: 'muted' }
}

export function PlanHistoryList({ plans }: { plans: StudentPlan[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {plans.map((plan) => {
        const outcome = describeOutcome(plan)
        return (
          <li key={plan.id} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-4">
            <IconTile icon={History} tone="neutral" />
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="truncate font-display text-sm font-bold">{plan.name}</p>
              <p className="text-xs text-fg-muted">
                {PLAN_TYPE_LABEL[plan.type]} · {formatters.shortDate(fromDateKey(plan.startsOn))} – {formatters.shortDate(fromDateKey(plan.expiresOn))}
              </p>
              {plan.classesTotal !== null && (
                <p className="text-xs text-fg-subtle">
                  Usaste {plan.classesUsed} de {plan.classesTotal} clases
                </p>
              )}
            </div>
            <Stamp tone={outcome.tone}>{outcome.label}</Stamp>
          </li>
        )
      })}
    </ul>
  )
}
