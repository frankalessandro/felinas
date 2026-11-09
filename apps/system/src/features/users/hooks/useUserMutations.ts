import { useMutation, useQueryClient } from '@tanstack/react-query'
import { studentKeys } from '@/features/students/queries'
import { teacherKeys } from '@/features/teachers/queries'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { approveStudent, approveTeacher, approveUser, setUserStatus } from '../api/users.api'
import { userKeys } from '../queries'
import type { UserStatus } from '../types'

/** Aprobar o cambiar de rol toca usuarios, alumnas y fichas de profe (vínculo `profile_id`). */
function useInvalidateAccounts() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: userKeys.all }),
      queryClient.invalidateQueries({ queryKey: studentKeys.all }),
      queryClient.invalidateQueries({ queryKey: teacherKeys.all }),
    ])
}

export function useApproveStudent() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: approveStudent,
    onSuccess: async (_, { planId }) => {
      await invalidate()
      toastSuccess('Alumna aprobada', planId ? 'Su plan ya quedó asignado.' : 'Puedes asignarle un plan desde su ficha.')
    },
    onError: async (error) => {
      // La aprobación puede haberse completado aunque el plan fallara: refrescar evita mostrar datos viejos.
      await invalidate()
      toastError('No se pudo completar la aprobación')(error)
    },
  })
}

export function useApproveTeacher() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: approveTeacher,
    onSuccess: async () => {
      await invalidate()
      toastSuccess('Profe aprobada', 'Ya puede ver su agenda.')
    },
    onError: async (error) => {
      await invalidate()
      toastError('No se pudo aprobar a la profe')(error)
    },
  })
}

export function useApproveAdmin() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: (profileId: string) => approveUser(profileId, 'admin'),
    onSuccess: async () => {
      await invalidate()
      toastSuccess('Admin aprobado', 'Ahora tiene acceso total al panel.')
    },
    onError: toastError('No se pudo aprobar al admin'),
  })
}

export function useSetUserStatus() {
  const invalidate = useInvalidateAccounts()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: Extract<UserStatus, 'active' | 'inactive'> }) => setUserStatus(id, status),
    onSuccess: async (_, { status }) => {
      await invalidate()
      toastSuccess(status === 'active' ? 'Cuenta reactivada' : 'Cuenta desactivada')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}

