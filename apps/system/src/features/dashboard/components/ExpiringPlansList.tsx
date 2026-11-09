import { Stamp } from '@/components/brand'
import { AsyncContent, Avatar, EmptyState } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { formatters } from '@/lib/dates'
import type { ExpiringPlan } from '../types'

interface ExpiringPlansListProps {
  plans: ExpiringPlan[] | undefined
  isLoading: boolean
  error: Error | null
  onRetry: () => void
}

function describeExpiry(plan: ExpiringPlan): string {
  const parts = [`vence ${formatters.shortDate(plan.expiresOn)}`]
  if (plan.classesRemaining !== null) parts.push(plan.classesRemaining === 1 ? 'queda 1 clase' : `quedan ${plan.classesRemaining} clases`)
  return parts.join(' · ')
}

function reminderMessage(plan: ExpiringPlan): string {
  return `Hola, tu plan ${plan.planName} está por terminar. ¿Te ayudamos a renovarlo?`
}

export function ExpiringPlansList({ plans, isLoading, error, onRetry }: ExpiringPlansListProps) {
  return (
    <AsyncContent
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      isEmpty={!plans || plans.length === 0}
      empty={<EmptyState illustration="ticket" title="Todo con margen" description="Ningún plan está por vencer." className="py-7" />}
    >
      <ul className="flex flex-col gap-2">
        {plans?.map((plan) => {
          const name = plan.student.full_name ?? 'Alumna'
          return (
            <li key={plan.studentPlanId} className="flex items-center gap-3 rounded-xl bg-surface-2/60 p-2.5">
              <Avatar name={name} src={plan.student.avatar_url} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{name}</p>
                <p className="truncate text-xs text-fg-muted">
                  {plan.planName} · {describeExpiry(plan)}
                </p>
              </div>
              <Stamp tone="warn">
                {plan.daysToExpire === null ? 'Por vencer' : `${plan.daysToExpire} d`}
              </Stamp>
              <WhatsAppButton phone={plan.student.phone} name={name} message={reminderMessage(plan)} size="icon" />
            </li>
          )
        })}
      </ul>
    </AsyncContent>
  )
}
