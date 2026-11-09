import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { sessionKeys } from '@/features/schedule/queries'
import { studentPlanKeys } from '@/features/student-plan/queries'
import { bookSession, cancelBooking } from '../api/bookings.api'
import { getBookingErrorMessage } from '../labels'
import { bookingKeys } from '../queries'
import type { BookingWithSession } from '../types'

/** Reservar o cancelar mueve cupos, saldo del plan y la lista de próximas: se refresca todo eso. */
function useInvalidateAfterBookingChange() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
      queryClient.invalidateQueries({ queryKey: bookingKeys.all }),
      queryClient.invalidateQueries({ queryKey: studentPlanKeys.all }),
    ])
}

export function useBookSession() {
  const invalidate = useInvalidateAfterBookingChange()
  return useMutation({
    mutationFn: bookSession,
    onSuccess: (booking) => {
      if (booking.status === 'waitlist') {
        const position = booking.waitlist_position
        sileo.info({
          title: 'Estás en lista de espera',
          description: position ? `Vas en el puesto ${position}. Te avisamos si se libera un cupo.` : 'Te avisamos si se libera un cupo.',
        })
        return
      }
      sileo.success({ title: '¡Reservada!', description: 'Te esperamos. Puedes cancelar gratis hasta que empiece.' })
    },
    onError: (error) => sileo.error({ title: 'No pudimos reservar', description: getBookingErrorMessage(error) }),
    onSettled: invalidate,
  })
}

type BookingSnapshot = [readonly unknown[], BookingWithSession[] | undefined][]

export function useCancelBooking() {
  const queryClient = useQueryClient()
  const invalidate = useInvalidateAfterBookingChange()

  return useMutation({
    mutationFn: cancelBooking,
    // La reserva desaparece al instante de todas las listas; si falla, se restaura.
    onMutate: async (bookingId: string): Promise<{ snapshot: BookingSnapshot }> => {
      await queryClient.cancelQueries({ queryKey: bookingKeys.all })
      const snapshot = queryClient.getQueriesData<BookingWithSession[]>({ queryKey: bookingKeys.all })
      queryClient.setQueriesData<BookingWithSession[]>({ queryKey: bookingKeys.all }, (list) => list?.filter((b) => b.id !== bookingId))
      return { snapshot }
    },
    onError: (error, _bookingId, context) => {
      context?.snapshot.forEach(([key, data]) => queryClient.setQueryData(key, data))
      sileo.error({ title: 'No pudimos cancelar', description: getBookingErrorMessage(error) })
    },
    onSuccess: () => sileo.success({ title: 'Reserva cancelada', description: 'No se descontó ninguna clase de tu plan.' }),
    onSettled: invalidate,
  })
}
