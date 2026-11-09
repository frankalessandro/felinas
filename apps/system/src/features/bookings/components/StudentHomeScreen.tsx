import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowRight, CalendarCheck, CalendarClock, CalendarPlus, ListChecks, TicketCheck } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/brand'
import { AsyncContent, EmptyState, PageHeader, Skeleton, StatCard, buttonVariants } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { NoPlanBanner } from '@/features/student-plan/components/NoPlanBanner'
import { PlanAlertBanner } from '@/features/student-plan/components/PlanAlertBanner'
import { PlanFrozenBanner } from '@/features/student-plan/components/PlanFrozenBanner'
import { PlanSummaryCard } from '@/features/student-plan/components/PlanSummaryCard'
import { useStudentPlans } from '@/features/student-plan/hooks/useStudentPlans'
import { getActivePlans, getPlanAlerts } from '@/features/student-plan/plans'
import type { StudentPlan } from '@/features/student-plan/types'
import { formatters, toAcademyTime } from '@/lib/dates'
import { getQuotaUsage } from '../quota'
import { countReservedByPlan } from '../eligibility'
import { getHistoryStats } from '../history'
import { useMyPlanBookings, useMyUpcomingBookings } from '../hooks/useBookingQueries'
import { useMinuteClock } from '../hooks/useMinuteClock'
import type { BookingWithSession } from '../types'
import { CancelBookingDialog, type CancelTarget } from './CancelBookingDialog'
import { NextClassCard } from './NextClassCard'
import { UpcomingBookingsList } from './UpcomingBookingsList'

const NOON = 12
const EVENING = 19

function getGreeting(now: Date): string {
  const hour = toAcademyTime(now).getHours()
  if (hour < NOON) return 'Buenos días,'
  if (hour < EVENING) return 'Buenas tardes,'
  return 'Buenas noches,'
}

function getFirstName(fullName: string | null, email: string | null): string {
  const name = fullName?.trim().split(/\s+/)[0]
  return name || email?.split('@')[0] || 'Alumna'
}

function toCancelTarget(booking: BookingWithSession): CancelTarget {
  return {
    bookingId: booking.id,
    title: booking.session.title ?? booking.session.class_type?.name ?? 'Clase',
    startsAt: booking.session.starts_at,
    isWaitlist: booking.status === 'waitlist',
  }
}

/** Suma de clases disponibles de los paquetes activos; `null` si no hay paquetes con saldo. */
function sumClassesRemaining(plans: StudentPlan[]): number | null {
  const packages = plans.filter((plan) => plan.type === 'package' && plan.classesRemaining !== null)
  if (packages.length === 0) return null
  return packages.reduce((total, plan) => total + (plan.classesRemaining ?? 0), 0)
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function HomeSkeleton() {
  return (
    <>
      <div className="grid gap-3 sm:grid-cols-3">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <Skeleton className="h-52" />
      <Skeleton className="h-24" />
    </>
  )
}

function SectionTitle({ id, icon, children }: { id: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <h2 id={id} className="flex items-center gap-2.5 font-display text-base font-bold">
      <IconTile icon={icon} tone="violeta" size="sm" />
      {children}
    </h2>
  )
}

export function StudentHomeScreen() {
  const profile = useCurrentProfile()
  const now = useMinuteClock()
  const plansQuery = useStudentPlans()
  const upcomingQuery = useMyUpcomingBookings()
  const planBookings = useMyPlanBookings()
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null)

  const plans = plansQuery.data ?? []
  const upcoming = upcomingQuery.data ?? []
  const activePlans = getActivePlans(plans)
  const alerts = activePlans.flatMap(getPlanAlerts)
  const reservedByPlan = countReservedByPlan(upcoming)

  const nextClass = upcoming.find((booking) => booking.status === 'booked')
  const otherBookings = upcoming.filter((booking) => booking.id !== nextClass?.id)
  const isLoading = plansQuery.isPending || upcomingQuery.isPending || planBookings.isPending
  const error = plansQuery.error ?? upcomingQuery.error ?? planBookings.error

  const hasBanners = alerts.length > 0 || activePlans.some((plan) => plan.isFrozen)
  const classesRemaining = sumClassesRemaining(activePlans)
  const attendedThisMonth = getHistoryStats(planBookings.bookings, now).attendedThisMonth
  const nextStart = nextClass?.session.starts_at

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <div className="relative isolate">
        <div aria-hidden className="absolute -left-10 -top-16 -z-10 size-64 rounded-full bg-rosa/15 blur-[90px]" />
        <PageHeader
          title={getGreeting(now)}
          accent={getFirstName(profile.full_name, profile.email)}
          description={capitalize(formatters.fullDate(now))}
          actions={
            <Link to="/student/book" className={buttonVariants({ size: 'lg', className: 'w-full sm:w-auto' })}>
              <CalendarPlus className="size-5" aria-hidden />
              Reservar clase
            </Link>
          }
        />
      </div>

      <AsyncContent isLoading={isLoading} error={error} onRetry={() => void Promise.all([plansQuery.refetch(), upcomingQuery.refetch(), planBookings.refetch()])} loading={<HomeSkeleton />}>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard
            icon={TicketCheck}
            tone="rosa"
            label="Clases restantes"
            value={classesRemaining ?? '—'}
            hint={classesRemaining === null ? 'Tu plan no es por paquete' : 'En tus paquetes activos'}
          />
          <StatCard
            icon={CalendarClock}
            tone="violeta"
            label="Próxima clase"
            value={nextStart ? formatters.time(nextStart) : '—'}
            hint={nextStart ? capitalize(`${formatters.weekdayLong(nextStart)} ${formatters.dayNumber(nextStart)}`) : 'Sin reservas'}
          />
          <StatCard
            icon={CalendarCheck}
            tone="ok"
            label="Asistidas este mes"
            value={attendedThisMonth}
            hint="Clases que ya tomaste"
            className="col-span-2 sm:col-span-1"
          />
        </div>

        {hasBanners && (
          <div className="flex flex-col gap-3">
            {activePlans.filter((plan) => plan.isFrozen).map((plan) => (
              <PlanFrozenBanner key={plan.id} plan={plan} />
            ))}
            {alerts.map((alert) => (
              <PlanAlertBanner key={alert.id} alert={alert} />
            ))}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="flex flex-col gap-6 lg:col-span-7">
            {nextClass ? (
              <NextClassCard booking={nextClass} now={now} onCancel={(booking) => setCancelTarget(toCancelTarget(booking))} />
            ) : (
              <EmptyState
                illustration="ticket"
                title="Aún no tienes clases reservadas"
                description="Reserva tu próxima clase y asegura tu cupo antes de que se llene."
                action={
                  <Link to="/student/book" className={buttonVariants({ variant: 'outline' })}>
                    Ver clases disponibles
                  </Link>
                }
              />
            )}

            {otherBookings.length > 0 && (
              <section aria-labelledby="upcoming-heading" className="flex flex-col gap-3">
                <SectionTitle id="upcoming-heading" icon={ListChecks}>
                  Tus próximas reservas
                </SectionTitle>
                <UpcomingBookingsList bookings={otherBookings} onCancel={(booking) => setCancelTarget(toCancelTarget(booking))} />
              </section>
            )}
          </div>

          <section aria-labelledby="plan-heading" className="flex flex-col gap-3 lg:col-span-5">
            <SectionTitle id="plan-heading" icon={TicketCheck}>
              Tu plan
            </SectionTitle>
            {activePlans.length === 0 ? (
              <NoPlanBanner />
            ) : (
              activePlans.map((plan) => (
                <PlanSummaryCard
                  key={plan.id}
                  plan={plan}
                  reserved={reservedByPlan.get(plan.id) ?? 0}
                  quotaUsage={getQuotaUsage(plan, planBookings.bookings, now)}
                />
              ))
            )}
            <Link to="/student/plan" className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-rosa-hover underline-offset-4 hover:underline">
              Ver detalle de mi plan
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </section>
        </div>
      </AsyncContent>

      <CancelBookingDialog target={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  )
}
