import { queryOptions } from '@tanstack/react-query'
import { getReceiptUrl, listRecentPayments, listStudentPayments } from './api/payments.api'

export const paymentKeys = {
  all: ['payments'] as const,
  student: (studentId: string) => [...paymentKeys.all, 'student', studentId] as const,
  recent: (from: string, to: string) => [...paymentKeys.all, 'recent', from, to] as const,
  receipt: (path: string) => [...paymentKeys.all, 'receipt', path] as const,
}

const RECENT_LIMIT = 15

export const studentPaymentsQuery = (studentId: string) =>
  queryOptions({ queryKey: paymentKeys.student(studentId), queryFn: () => listStudentPayments(studentId) })

export const recentPaymentsQuery = (from: string, to: string) =>
  queryOptions({ queryKey: paymentKeys.recent(from, to), queryFn: () => listRecentPayments(from, to, RECENT_LIMIT) })

/** La URL firmada caduca a los 10 minutos: se vuelve a pedir cada vez que se abre el comprobante. */
export const receiptUrlQuery = (path: string) =>
  queryOptions({ queryKey: paymentKeys.receipt(path), queryFn: () => getReceiptUrl(path), staleTime: 0, gcTime: 0 })
