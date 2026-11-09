import { useMutation, useQueryClient } from '@tanstack/react-query'
import { invalidateMoney } from '@/features/payments/invalidation'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { saveAdminNotes } from '../api/studentHistory.api'
import { assignPlan, cancelStudentPlan } from '../api/studentPlans.api'
import type { AssignPlanInput } from '../api/studentPlans.api'
import { setStudentStatus, updateStudentProfile } from '../api/students.api'
import { studentKeys } from '../queries'
import type { StudentProfileFormData } from '../schemas'

export function useUpdateStudentProfile(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: StudentProfileFormData) => updateStudentProfile(studentId, data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toastSuccess('Perfil actualizado')
    },
    onError: toastError('No se pudo guardar el perfil'),
  })
}

export function useSetStudentStatus(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (status: 'active' | 'inactive') => setStudentStatus(studentId, status),
    onSuccess: async (_, status) => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.all })
      toastSuccess(status === 'active' ? 'Alumna reactivada' : 'Alumna desactivada')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}

export function useAssignPlan(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: Omit<AssignPlanInput, 'studentId'>) => assignPlan({ studentId, ...input }),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Plan asignado')
    },
    onError: toastError('No se pudo asignar el plan'),
  })
}

export function useCancelStudentPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: cancelStudentPlan,
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Plan cancelado')
    },
    onError: toastError('No se pudo cancelar el plan'),
  })
}

export function useSaveAdminNotes(studentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (notes: string) => saveAdminNotes(studentId, notes),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: studentKeys.adminNotes(studentId) })
      toastSuccess('Notas guardadas')
    },
    onError: toastError('No se pudieron guardar las notas'),
  })
}
