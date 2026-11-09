import { History, ListChecks, TicketCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { AsyncContent, PageHeader, Skeleton } from '@/components/ui'
import { countReservedByPlan } from '@/features/bookings/eligibility'
import { useMinuteClock } from '@/features/bookings/hooks/useMinuteClock'
import { useMyPlanBookings, useMyUpcomingBookings } from '@/features/bookings/hooks/useBookingQueries'
import { getQuotaUsage } from '@/features/bookings/quota'
import { useStudentPlans } from '../hooks/useStudentPlans'
import { getActivePlans, getPastPlans, getPlanAlerts } from '../plans'
import { NoPlanBanner } from './NoPlanBanner'
import { PlanAlertBanner } from './PlanAlertBanner'
import { PlanFrozenBanner } from './PlanFrozenBanner'
import { PlanHistoryList } from './PlanHistoryList'
import { PlanRules } from './PlanRules'
import { PlanSummaryCard } from './PlanSummaryCard'

function SectionTitle({ id, icon, children }: { id: string; icon: LucideIcon; children: string }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 font-display text-base font-bold">
      <IconTile icon={icon} tone="violeta" size="sm" />
      {children}
    </h2>
  )
}

function PlanSkeleton() {
  return (
    <>
      <Skeleton className="h-80" />
      <Skeleton className="h-24" />
    </>
  )
}

export function PlanScreen() {
  const plansQuery = useStudentPlans()
  const upcomingQuery = useMyUpcomingBookings()
  const planBookings = useMyPlanBookings()
  const now = useMinuteClock()

  const plans = plansQuery.data ?? []
  const activePlans = getActivePlans(plans)
  const pastPlans = getPastPlans(plans)
  const alerts = activePlans.flatMap(getPlanAlerts)
  const reservedByPlan = countReservedByPlan(upcomingQuery.data ?? [])

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader icon={TicketCheck} title="Mi plan" description="Cuánto te queda este mes, qué estilos puedes reservar y cómo va tu pago." />

      <AsyncContent
        isLoading={plansQuery.isPending || planBookings.isPending}
        error={plansQuery.error ?? planBookings.error}
        onRetry={() => void Promise.all([plansQuery.refetch(), planBookings.refetch()])}
        loading={<PlanSkeleton />}
      >
        <div className="flex flex-col gap-3">
          {activePlans.filter((plan) => plan.isFrozen).map((plan) => (
            <PlanFrozenBanner key={plan.id} plan={plan} />
          ))}
          {alerts.map((alert) => (
            <PlanAlertBanner key={alert.id} alert={alert} />
          ))}
          {activePlans.length === 0 ? (
            <NoPlanBanner />
          ) : (
            activePlans.map((plan) => (
              <PlanSummaryCard
                key={plan.id}
                plan={plan}
                reserved={reservedByPlan.get(plan.id) ?? 0}
                quotaUsage={getQuotaUsage(plan, planBookings.bookings, now)}
                variant="detailed"
              />
            ))
          )}
        </div>

        <section aria-labelledby="rules-heading" className="flex flex-col gap-3">
          <SectionTitle id="rules-heading" icon={ListChecks}>Cómo funciona</SectionTitle>
          <PlanRules />
        </section>

        {pastPlans.length > 0 && (
          <section aria-labelledby="history-heading" className="flex flex-col gap-3">
            <SectionTitle id="history-heading" icon={History}>Planes anteriores</SectionTitle>
            <PlanHistoryList plans={pastPlans} />
          </section>
        )}
      </AsyncContent>
    </div>
  )
}
