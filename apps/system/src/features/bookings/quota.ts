import type { PlanQuota, StudentPlan } from '@/features/student-plan/types'
import type { BookingLike } from './eligibility'

export interface QuotaUsage {
  quota: PlanQuota
  used: number
}

/**
 * Misma cuenta que la base (`_plan_reason`): reservas `booked` futuras aún sin consumir
 * más asistencias consumidas, de esa categoría y de esa instancia de plan.
 */
function countsTowardQuota(booking: BookingLike, now: Date): boolean {
  if (booking.status !== 'booked') return false
  if (booking.attendance?.consumed) return true
  return booking.session.status === 'scheduled' && new Date(booking.session.starts_at) > now
}

export function getCategoryUsed(plan: StudentPlan, categoryId: string, bookings: BookingLike[], now: Date): number {
  const categoryByType = new Map(plan.classTypes.map((type) => [type.id, type.categoryId] as const))
  return bookings.filter(
    (booking) =>
      booking.student_plan_id === plan.id &&
      categoryByType.get(booking.session.class_type_id) === categoryId &&
      countsTowardQuota(booking, now),
  ).length
}

/** Uso por categoría de un plan con cupos; lista vacía si el plan no define cupos. */
export function getQuotaUsage(plan: StudentPlan, bookings: BookingLike[], now: Date): QuotaUsage[] {
  return plan.quotas.map((quota) => ({ quota, used: getCategoryUsed(plan, quota.categoryId, bookings, now) }))
}
