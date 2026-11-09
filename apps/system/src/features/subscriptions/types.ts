import type { Tables } from '@/types/database'
import type { PaymentStatus } from '@/features/payments/types'

export type SubscriptionBucket = 'expired_not_renewed' | 'balance_due' | 'expiring_soon' | 'no_plan' | 'ok'

export const SUBSCRIPTION_BUCKETS: SubscriptionBucket[] = ['expired_not_renewed', 'balance_due', 'expiring_soon', 'no_plan', 'ok']

/** Una fila del tablero: una alumna activa y su plan del mes elegido. */
export interface SubscriptionRow {
  studentId: string
  fullName: string
  avatarUrl: string | null
  phone: string | null
  studentPlanId: string | null
  planId: string | null
  planName: string | null
  price: number | null
  paid: number
  balance: number | null
  paymentStatus: PaymentStatus | null
  classesTotal: number | null
  classesUsed: number | null
  classesRemaining: number | null
  expiresOn: string | null
  isFrozen: boolean
  prevStudentPlanId: string | null
  prevPlanName: string | null
  lastPaymentOn: string | null
  lastAttendedAt: string | null
  bucket: SubscriptionBucket
}

export interface RevenueSlice {
  key: string
  label: string
  amount: number
  count: number
}

export interface RevenueReport {
  total: number
  count: number
  byMethod: RevenueSlice[]
  byPlan: RevenueSlice[]
}

export interface OutstandingBalance {
  total: number
  students: number
}

export type StudentPlanRow = Tables<'student_plans'>
