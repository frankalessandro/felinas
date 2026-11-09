import { supabase } from '@/lib/supabase'
import { toAppError, unwrap } from '@/lib/errors'
import type { ExpiringPlan } from '../types'

export async function countPendingUsers(): Promise<number> {
  const { count, error } = await supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('status', 'pending').is('deleted_at', null)
  if (error) throw toAppError(error)
  return count ?? 0
}

/** Planes activos por vencer (≤7 días o ≤2 clases). La vista no trae datos de la alumna: se piden aparte. */
export async function listExpiringPlans(): Promise<ExpiringPlan[]> {
  const plans = unwrap(
    await supabase
      .from('student_plan_summary')
      .select('student_plan_id, student_id, plan_name, classes_remaining, days_to_expire, expires_on')
      .eq('is_expiring', true)
      .eq('effective_status', 'active')
      .order('days_to_expire'),
  )
  const studentIds = [...new Set(plans.flatMap((plan) => (plan.student_id ? [plan.student_id] : [])))]
  if (studentIds.length === 0) return []

  const profiles = unwrap(await supabase.from('profiles').select('id, full_name, phone, avatar_url').in('id', studentIds))
  const byId = new Map(profiles.map((profile) => [profile.id, profile]))

  return plans.flatMap((plan) => {
    const student = plan.student_id ? byId.get(plan.student_id) : undefined
    if (!student || !plan.student_plan_id || !plan.expires_on) return []
    return [
      {
        studentPlanId: plan.student_plan_id,
        planName: plan.plan_name ?? 'Plan',
        classesRemaining: plan.classes_remaining,
        daysToExpire: plan.days_to_expire,
        expiresOn: plan.expires_on,
        student,
      },
    ]
  })
}

export interface OutstandingBalance {
  total: number
  students: number
}

/** Total cobrado en el rango (fechas yyyy-MM-dd): se suma la dimensión por mes, que cubre cada pago una sola vez. */
export async function getCollectedTotal(range: { from: string; to: string }): Promise<number> {
  const rows = unwrap(await supabase.rpc('admin_revenue_report', { p_from: range.from, p_to: range.to }))
  return rows.filter((row) => row.dimension === 'month').reduce((sum, row) => sum + Number(row.amount), 0)
}

export async function getOutstandingBalance(): Promise<OutstandingBalance> {
  const rows = unwrap(await supabase.rpc('admin_outstanding_balance'))
  const row = rows[0]
  return { total: Number(row?.total ?? 0), students: Number(row?.students ?? 0) }
}
