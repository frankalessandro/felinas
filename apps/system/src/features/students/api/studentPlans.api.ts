import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { PlanSummary, StudentPlanDetail } from '../types'

export async function listStudentPlans(studentId: string): Promise<PlanSummary[]> {
  return unwrap(await supabase.from('student_plan_summary').select('*').eq('student_id', studentId).order('starts_on', { ascending: false }))
}

export interface AssignPlanInput {
  studentId: string
  planId: string
  startsOn?: string
  /** Primer día del mes calendario del plan (`yyyy-MM-dd`); el mes actual empieza hoy y uno futuro el día 1. */
  month?: string
  /** Valor pactado si difiere del precio del plan; `null` usa el precio de catálogo. */
  price?: number | null
  notes?: string | null
}

/** El cálculo de vencimiento y cupo lo hace la RPC: nunca se arma el plan desde el cliente. */
export async function assignPlan({ studentId, planId, startsOn, month, price, notes }: AssignPlanInput) {
  return unwrap(
    await supabase.rpc('assign_plan', {
      p_student_id: studentId,
      p_plan_id: planId,
      p_starts_on: startsOn,
      p_month: month,
      p_price: price ?? undefined,
      p_notes: notes ?? undefined,
    }),
  )
}

/** Planes de la alumna con su saldo (vista de balances) y el momento en que se congelaron. */
export async function listStudentPlanDetails(studentId: string): Promise<StudentPlanDetail[]> {
  const [summaries, balances, rows] = await Promise.all([
    supabase.from('student_plan_summary').select('*').eq('student_id', studentId).order('starts_on', { ascending: false }),
    supabase.from('student_plan_balances').select('*').eq('student_id', studentId),
    supabase.from('student_plans').select('id, frozen_at, plan_id').eq('student_id', studentId),
  ])
  const balanceByPlan = new Map(unwrap(balances).map((balance) => [balance.student_plan_id, balance]))
  const rowByPlan = new Map(unwrap(rows).map((row) => [row.id, row]))
  return unwrap(summaries).flatMap((summary) => {
    if (!summary.student_plan_id) return []
    const balance = balanceByPlan.get(summary.student_plan_id)
    return [
      {
        ...summary,
        student_plan_id: summary.student_plan_id,
        price: balance?.price ?? null,
        paid: balance?.paid ?? 0,
        balance: balance?.balance ?? null,
        payment_status: balance?.payment_status ?? null,
        discount_note: balance?.discount_note ?? null,
        frozen_at: rowByPlan.get(summary.student_plan_id)?.frozen_at ?? null,
      },
    ]
  })
}

export async function cancelStudentPlan(studentPlanId: string): Promise<void> {
  unwrap(await supabase.from('student_plans').update({ status: 'cancelled' }).eq('id', studentPlanId).select('id').single())
}
