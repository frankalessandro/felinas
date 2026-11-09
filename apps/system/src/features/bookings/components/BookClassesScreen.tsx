import { useState } from 'react'
import { CalendarPlus } from 'lucide-react'
import { CalendarView } from '@/components/calendar'
import { AsyncContent, PageHeader, Skeleton } from '@/components/ui'
import { resolveCalendarSearch } from '@/features/schedule/calendarSearch'
import { useCalendarSessions } from '@/features/schedule/hooks/useCalendarSessions'
import { toCalendarEvent } from '@/features/schedule/mappers'
import type { SessionWithDetails } from '@/features/schedule/types'
import { NoPlanBanner } from '@/features/student-plan/components/NoPlanBanner'
import { PlanAlertBanner } from '@/features/student-plan/components/PlanAlertBanner'
import { PlanFrozenBanner } from '@/features/student-plan/components/PlanFrozenBanner'
import { useStudentPlans } from '@/features/student-plan/hooks/useStudentPlans'
import { getActiveGroupPlans, getAllowedClassTypes, getPlanAlerts } from '@/features/student-plan/plans'
import { toDateKey } from '@/lib/dates'
import { getBookingEligibility, mergeBookings, type BookingEligibility } from '../eligibility'
import { useBookSession } from '../hooks/useBookingMutations'
import { useClassTypes, useMyAttendanceHistory, useMyCalendarBookings, useMyUpcomingBookings } from '../hooks/useBookingQueries'
import { useMinuteClock } from '../hooks/useMinuteClock'
import type { BookSearch } from '../searchSchema'
import { BookingActionButton } from './BookingActionButton'
import { CancelBookingDialog, type CancelTarget } from './CancelBookingDialog'
import { ClassTypeTabs } from './ClassTypeTabs'
import { SessionDetailSheet } from './SessionDetailSheet'

interface BookClassesScreenProps {
  search: BookSearch
  onSearchChange: (patch: Partial<BookSearch>) => void
}

function toCancelTarget(session: SessionWithDetails, eligibility: BookingEligibility): CancelTarget | null {
  if (!eligibility.booking) return null
  return {
    bookingId: eligibility.booking.id,
    title: session.title ?? session.class_type?.name ?? 'Clase',
    startsAt: session.starts_at,
    isWaitlist: eligibility.action === 'waitlisted',
  }
}

function BookSkeleton() {
  return (
    <>
      <Skeleton className="h-11" />
      <Skeleton className="h-16" />
      <Skeleton className="h-28" />
      <Skeleton className="h-28" />
    </>
  )
}

export function BookClassesScreen({ search, onSearchChange }: BookClassesScreenProps) {
  const now = useMinuteClock()
  const { view, date } = resolveCalendarSearch(search)

  const sessionsQuery = useCalendarSessions(view, date)
  const plansQuery = useStudentPlans()
  const upcomingQuery = useMyUpcomingBookings()
  const weekBookingsQuery = useMyCalendarBookings(view, date)
  // Las ya consumidas cuentan para el cupo por categoría del plan.
  const historyQuery = useMyAttendanceHistory()
  const typesQuery = useClassTypes()
  const book = useBookSession()

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [cancelTarget, setCancelTarget] = useState<CancelTarget | null>(null)

  const isLoading = sessionsQuery.isPending || plansQuery.isPending || upcomingQuery.isPending || weekBookingsQuery.isPending || historyQuery.isPending
  const error = sessionsQuery.error ?? plansQuery.error ?? upcomingQuery.error ?? weekBookingsQuery.error ?? historyQuery.error
  const retry = () => {
    void sessionsQuery.refetch()
    void plansQuery.refetch()
    void upcomingQuery.refetch()
    void weekBookingsQuery.refetch()
    void historyQuery.refetch()
  }

  const plans = plansQuery.data ?? []
  const sessions = sessionsQuery.data ?? []
  const bookings = mergeBookings(upcomingQuery.data ?? [], weekBookingsQuery.data ?? [], historyQuery.data ?? [])
  const activePlans = getActiveGroupPlans(plans)
  const allowedTypes = getAllowedClassTypes(plans)
  const allowedIds = new Set(allowedTypes.map((type) => type.id))
  const alerts = activePlans.flatMap(getPlanAlerts)

  const eligibilityBySession = new Map(
    sessions.map((session) => [session.id, getBookingEligibility({ session, plans, bookings, now })] as const),
  )
  const sessionsById = new Map(sessions.map((session) => [session.id, session] as const))

  const visibleSessions = search.type ? sessions.filter((session) => session.class_type_id === search.type) : sessions
  const events = visibleSessions.map((session) => {
    const eligibility = eligibilityBySession.get(session.id)
    return toCalendarEvent(session, {
      badge: eligibility?.badge ?? undefined,
      disabled: eligibility?.action === 'unavailable',
    })
  })

  const selectedSession = selectedId ? (sessionsById.get(selectedId) ?? null) : null
  const selectedEligibility = selectedId ? (eligibilityBySession.get(selectedId) ?? null) : null
  const pendingSessionId = book.isPending ? book.variables : null

  function handleBook(sessionId: string) {
    book.mutate(sessionId)
  }

  function handleCancel(sessionId: string) {
    const session = sessionsById.get(sessionId)
    const eligibility = eligibilityBySession.get(sessionId)
    if (!session || !eligibility) return
    setCancelTarget(toCancelTarget(session, eligibility))
  }

  return (
    <div className="flex animate-fade-up flex-col gap-5">
      <PageHeader icon={CalendarPlus} title="Reservar clases" description="Elige una clase, reserva en un toque y cancela gratis hasta que empiece." />

      <AsyncContent isLoading={isLoading} error={error} onRetry={retry} loading={<BookSkeleton />}>
        <div className="flex flex-col gap-4">
          {activePlans.length === 0 && <NoPlanBanner consequence="Puedes ver el horario, pero no reservar." />}
          {activePlans.filter((plan) => plan.isFrozen).map((plan) => (
            <PlanFrozenBanner key={plan.id} plan={plan} />
          ))}
          {alerts.map((alert) => (
            <PlanAlertBanner key={alert.id} alert={alert} />
          ))}

          <ClassTypeTabs
            types={typesQuery.data ?? []}
            value={search.type}
            onChange={(type) => onSearchChange({ type })}
            allowedIds={activePlans.length > 0 ? allowedIds : undefined}
          />

          <CalendarView
            view={view}
            onViewChange={(next) => onSearchChange({ view: next })}
            date={date}
            onDateChange={(next) => onSearchChange({ date: toDateKey(next) })}
            events={events}
            onEventClick={(event) => setSelectedId(event.id)}
            renderAction={(event) => {
              const eligibility = eligibilityBySession.get(event.id)
              if (!eligibility || event.kind === 'private' || event.status === 'cancelled') return null
              return (
                <BookingActionButton
                  eligibility={eligibility}
                  pending={pendingSessionId === event.id}
                  onBook={() => handleBook(event.id)}
                  onCancel={() => handleCancel(event.id)}
                />
              )
            }}
          />
        </div>
      </AsyncContent>

      <SessionDetailSheet
        session={selectedSession}
        eligibility={selectedEligibility}
        pending={selectedId !== null && pendingSessionId === selectedId}
        onClose={() => setSelectedId(null)}
        onBook={() => selectedId && handleBook(selectedId)}
        onCancel={() => {
          if (!selectedId) return
          setSelectedId(null)
          handleCancel(selectedId)
        }}
      />
      <CancelBookingDialog target={cancelTarget} onClose={() => setCancelTarget(null)} />
    </div>
  )
}
