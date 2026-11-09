import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { toAppError } from '@/lib/errors'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { invalidateMoney } from '@/features/payments/invalidation'
import { sessionKeys } from '@/features/schedule/queries'
import { freezePlan, generateMonthSessions, renewPlan, renewPlansBulk, unfreezePlan } from '../api/subscriptions.api'
import type { MonthKey } from '../months'

export function useRenewPlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentPlanId: string) => renewPlan(studentPlanId),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Plan renovado')
    },
    onError: async (error) => {
      const appError = toAppError(error)
      if (appError.code === 'ALREADY_RENEWED') {
        sileo.info({ title: 'Este plan ya estaba renovado', description: 'Actualicé el tablero.' })
        await invalidateMoney(queryClient)
        return
      }
      toastError('No se pudo renovar el plan')(error)
    },
  })
}

export function useRenewPlansBulk() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentPlanIds, month }: { studentPlanIds: string[]; month: MonthKey }) => renewPlansBulk(studentPlanIds, month),
    onSuccess: () => invalidateMoney(queryClient),
    onError: toastError('No se pudieron renovar los planes'),
  })
}

export function useFreezePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentPlanId, reason }: { studentPlanId: string; reason: string | null }) => freezePlan(studentPlanId, reason),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Plan congelado', 'No podrá reservar hasta que lo descongeles.')
    },
    onError: toastError('No se pudo congelar el plan'),
  })
}

export function useUnfreezePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (studentPlanId: string) => unfreezePlan(studentPlanId),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Plan descongelado', 'El vencimiento se corrió los días congelados.')
    },
    onError: toastError('No se pudo descongelar el plan'),
  })
}

export function useGenerateMonthSessions() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (month: MonthKey) => generateMonthSessions(month),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: sessionKeys.all }),
    onError: toastError('No se pudieron generar las clases'),
  })
}
