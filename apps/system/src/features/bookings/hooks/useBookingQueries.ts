import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { getCalendarRange, type CalendarViewMode } from '@/lib/dates'
import { mergeBookings } from '../eligibility'
import { classTypesQuery, historyQuery, rangeBookingsQuery, upcomingBookingsQuery } from '../queries'

export function useMyUpcomingBookings() {
  const profile = useCurrentProfile()
  return useQuery(upcomingBookingsQuery(profile.id))
}

/** Reservas propias del periodo visible (semanas completas: sirve para validar el límite semanal). */
export function useMyCalendarBookings(view: CalendarViewMode, date: Date) {
  const profile = useCurrentProfile()
  const { from, to } = getCalendarRange(view, date)
  return useQuery({ ...rangeBookingsQuery(profile.id, from, to), placeholderData: keepPreviousData })
}

export function useMyAttendanceHistory() {
  const profile = useCurrentProfile()
  return useQuery(historyQuery(profile.id))
}

export function useClassTypes() {
  return useQuery(classTypesQuery)
}

/**
 * Reservas que cuentan para el uso del plan: próximas (pendientes de consumir) más las ya
 * pasadas con su asistencia (consumidas). Sirve para los cupos por categoría.
 */
export function useMyPlanBookings() {
  const upcoming = useMyUpcomingBookings()
  const history = useMyAttendanceHistory()
  return {
    bookings: mergeBookings(upcoming.data ?? [], history.data ?? []),
    isPending: upcoming.isPending || history.isPending,
    error: upcoming.error ?? history.error,
    refetch: () => Promise.all([upcoming.refetch(), history.refetch()]),
  }
}
