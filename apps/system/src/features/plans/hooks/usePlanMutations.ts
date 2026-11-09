import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { archivePlan, createPlan, updatePlan } from '../api/plans.api'
import { planKeys } from '../queries'
import type { PlanFormData } from '../schemas'

export function useSavePlan(planId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlanFormData) => (planId ? updatePlan(planId, data) : createPlan(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all })
      toastSuccess(planId ? 'Plan actualizado' : 'Plan creado')
    },
    onError: toastError('No se pudo guardar el plan'),
  })
}

export function useArchivePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archivePlan,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: planKeys.all })
      toastSuccess('Plan archivado', 'Las alumnas que ya lo tienen lo conservan.')
    },
    onError: toastError('No se pudo archivar el plan'),
  })
}
