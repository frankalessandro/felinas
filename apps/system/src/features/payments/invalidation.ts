import type { QueryClient } from '@tanstack/react-query'
import { studentKeys } from '@/features/students/queries'
import { subscriptionKeys } from '@/features/subscriptions/queries'
import { paymentKeys } from './queries'

/**
 * Renovar, cobrar, anular o congelar mueve a la vez el tablero de membresías, el saldo por plan
 * de la alumna y la lista de pagos: se refrescan juntos para que ninguna pantalla quede desfasada.
 */
export function invalidateMoney(queryClient: QueryClient): Promise<unknown> {
  return Promise.all([
    queryClient.invalidateQueries({ queryKey: subscriptionKeys.all }),
    queryClient.invalidateQueries({ queryKey: studentKeys.all }),
    queryClient.invalidateQueries({ queryKey: paymentKeys.all }),
  ])
}
