import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { attendanceKeys } from '@/features/attendance/queries'
import { dashboardKeys } from '@/features/dashboard/queries'
import { sessionKeys } from '@/features/schedule/queries'
import { getErrorMessage } from '@/lib/errors'
import { addStudentToSession, cancelBooking, cancelSession, createSession, generateSessions, updateSession } from '../api/sessionsAdmin.api'
import { sessionAdminKeys } from '../queries'
import { toSessionInsert, toSessionUpdate, type SessionFormValues } from '../schemas'

/** Cualquier cambio de sesiones/reservas afecta agenda, listas de asistencia y tablero. */
function invalidateSessionData(queryClient: QueryClient) {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
    queryClient.invalidateQueries({ queryKey: sessionAdminKeys.all }),
    queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
    queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
  ])
}

function notifyError(title: string) {
  return (error: unknown) => sileo.error({ title, description: getErrorMessage(error) })
}

export function useAddStudentToSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: addStudentToSession,
    onSuccess: async (booking) => {
      sileo.success({
        title: booking.status === 'waitlist' ? 'Agregada a la lista de espera' : 'Alumna agregada a la clase',
        description: 'Le avisamos por notificación.',
      })
      await invalidateSessionData(queryClient)
    },
    onError: notifyError('No se pudo agregar a la alumna'),
  })
}

export function useCancelBooking() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: async () => {
      sileo.success({ title: 'Reserva cancelada' })
      await invalidateSessionData(queryClient)
    },
    onError: notifyError('No se pudo cancelar la reserva'),
  })
}

export function useCancelSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelSession,
    onSuccess: async () => {
      sileo.success({ title: 'Clase cancelada', description: 'Las alumnas reservadas fueron notificadas. No se descontó ninguna clase.' })
      await invalidateSessionData(queryClient)
    },
    onError: notifyError('No se pudo cancelar la clase'),
  })
}

export function useGenerateSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: generateSessions,
    onSuccess: async (created) => {
      if (created === 0) sileo.info({ title: 'Todo al día', description: 'No había clases nuevas por crear en ese periodo.' })
      else sileo.success({ title: created === 1 ? 'Se creó 1 clase' : `Se crearon ${created} clases` })
      await invalidateSessionData(queryClient)
    },
    onError: notifyError('No se pudieron generar las clases'),
  })
}

interface SaveSessionInput {
  /** Con `id` se edita; sin `id` se crea. */
  id?: string
  values: SessionFormValues
}

export function useSaveSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, values }: SaveSessionInput) => (id ? updateSession(id, toSessionUpdate(values)) : createSession(toSessionInsert(values))),
    onSuccess: async (_session, { id }) => {
      sileo.success({ title: id ? 'Clase actualizada' : 'Clase creada' })
      await invalidateSessionData(queryClient)
    },
    onError: notifyError('No se pudo guardar la clase'),
  })
}
