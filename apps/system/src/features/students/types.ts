import type { Tables } from '@/types/database'

export type StudentProfile = Tables<'profiles'>
export type PlanSummary = Tables<'student_plan_summary'>

export interface StudentListItem {
  profile: StudentProfile
  /** Plan vigente que vence primero; `null` si la alumna no tiene ninguno. */
  activePlan: PlanSummary | null
}

export type StudentStatusFilter = 'active' | 'inactive' | 'all'

/** Plan de la alumna con saldo de clases (resumen) y estado de cuenta (balances). */
export type StudentPlanDetail = PlanSummary & {
  student_plan_id: string
  price: number | null
  paid: number
  balance: number | null
  payment_status: string | null
  discount_note: string | null
  frozen_at: string | null
}
