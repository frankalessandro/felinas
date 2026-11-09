import { queryOptions } from '@tanstack/react-query'
import { listBookings, listClassTypes } from './api/bookings.api'

const HISTORY_LIMIT = 200

export const bookingKeys = {
  /** Todo lo que cuelga de aquí es `BookingWithSession[]` (la actualización optimista depende de eso). */
  all: ['bookings'] as const,
  upcoming: (studentId: string) => [...bookingKeys.all, 'upcoming', studentId] as const,
  range: (studentId: string, from: string, to: string) => [...bookingKeys.all, 'range', studentId, from, to] as const,
  history: (studentId: string) => [...bookingKeys.all, 'history', studentId] as const,
  classTypes: ['class-types'] as const,
}

/** Reservas y listas de espera que aún no empiezan. */
export const upcomingBookingsQuery = (studentId: string) =>
  queryOptions({
    queryKey: bookingKeys.upcoming(studentId),
    queryFn: () => listBookings({ studentId, statuses: ['booked', 'waitlist'], from: new Date().toISOString(), order: 'asc' }),
  })

/** Reservas activas de una semana (incluye las que ya pasaron: cuentan para el límite semanal). */
export const rangeBookingsQuery = (studentId: string, from: string, to: string) =>
  queryOptions({
    queryKey: bookingKeys.range(studentId, from, to),
    queryFn: () => listBookings({ studentId, statuses: ['booked', 'waitlist'], from, to }),
  })

/** Clases ya empezadas en las que estuvo reservada, con su asistencia. */
export const historyQuery = (studentId: string) =>
  queryOptions({
    queryKey: bookingKeys.history(studentId),
    queryFn: () => listBookings({ studentId, statuses: ['booked'], to: new Date().toISOString(), order: 'desc', limit: HISTORY_LIMIT }),
  })

export const classTypesQuery = queryOptions({
  queryKey: bookingKeys.classTypes,
  queryFn: listClassTypes,
  staleTime: 5 * 60_000,
})
