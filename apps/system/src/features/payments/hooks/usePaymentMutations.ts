import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { registerPayment, setPlanPrice, voidPayment } from '../api/payments.api'
import type { RegisterPaymentInput } from '../api/payments.api'
import { invalidateMoney } from '../invalidation'

export function useRegisterPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: RegisterPaymentInput) => registerPayment(input),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Pago registrado')
    },
    onError: toastError('No se pudo registrar el pago'),
  })
}

export function useVoidPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ paymentId, reason }: { paymentId: string; reason: string }) => voidPayment(paymentId, reason),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Pago anulado', 'El saldo del plan se recalculó.')
    },
    onError: toastError('No se pudo anular el pago'),
  })
}

export function useSetPlanPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ studentPlanId, price, discountNote }: { studentPlanId: string; price: number; discountNote: string | null }) =>
      setPlanPrice(studentPlanId, price, discountNote),
    onSuccess: async () => {
      await invalidateMoney(queryClient)
      toastSuccess('Valor actualizado')
    },
    onError: toastError('No se pudo cambiar el valor'),
  })
}
