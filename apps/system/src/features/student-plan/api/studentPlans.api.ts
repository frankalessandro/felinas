import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { PaymentStatus, PlanClassType, PlanPayment, PlanQuota, PlanValidity, StudentPlan } from '../types'

function groupByPlan<T extends { plan_id: string }, V>(rows: T[], toValue: (row: T) => V | null): Map<string, V[]> {
  const byPlan = new Map<string, V[]>()
  for (const row of rows) {
    const value = toValue(row)
    if (value === null) continue
    byPlan.set(row.plan_id, [...(byPlan.get(row.plan_id) ?? []), value])
  }
  return byPlan
}

async function listPlanClassTypes(planIds: string[]): Promise<Map<string, PlanClassType[]>> {
  const links = unwrap(
    await supabase
      .from('plan_class_types')
      .select('plan_id, class_type:class_types ( id, name, color, category_id )')
      .in('plan_id', planIds),
  )
  return groupByPlan(links, (link) =>
    link.class_type
      ? { id: link.class_type.id, name: link.class_type.name, color: link.class_type.color, categoryId: link.class_type.category_id }
      : null,
  )
}

async function listPlanQuotas(planIds: string[]): Promise<Map<string, PlanQuota[]>> {
  const rows = unwrap(
    await supabase
      .from('plan_category_quotas')
      .select('plan_id, max_classes, category:class_categories ( id, name, color, sort_order )')
      .in('plan_id', planIds),
  )
  const byCategoryOrder = [...rows].sort((x, y) => (x.category?.sort_order ?? 0) - (y.category?.sort_order ?? 0))
  return groupByPlan(byCategoryOrder, (row) =>
    row.category ? { categoryId: row.category.id, name: row.category.name, color: row.category.color, max: row.max_classes } : null,
  )
}

async function listPlanValidity(planIds: string[]): Promise<Map<string, PlanValidity>> {
  const rows = unwrap(await supabase.from('plans').select('id, validity').in('id', planIds))
  return new Map(rows.map((row) => [row.id, row.validity]))
}

const PAYMENT_STATUSES: readonly PaymentStatus[] = ['paid', 'partial', 'pending', 'free']

function isPaymentStatus(value: string | null): value is PaymentStatus {
  return PAYMENT_STATUSES.some((status) => status === value)
}

async function listPayments(studentId: string): Promise<Map<string, PlanPayment>> {
  const rows = unwrap(await supabase.from('student_plan_balances').select('*').eq('student_id', studentId))
  const byStudentPlan = new Map<string, PlanPayment>()
  for (const row of rows) {
    if (!row.student_plan_id || !isPaymentStatus(row.payment_status)) continue
    byStudentPlan.set(row.student_plan_id, {
      status: row.payment_status,
      price: row.price ?? 0,
      paid: row.paid ?? 0,
      balance: row.balance ?? 0,
    })
  }
  return byStudentPlan
}

async function listFrozenSince(studentId: string): Promise<Map<string, string>> {
  const rows = unwrap(await supabase.from('student_plans').select('id, frozen_at').eq('student_id', studentId).not('frozen_at', 'is', null))
  return new Map(rows.flatMap((row) => (row.frozen_at ? [[row.id, row.frozen_at] as const] : [])))
}

/** Todos los planes de una alumna (vigentes e históricos), el que vence más tarde primero. */
export async function listStudentPlans(studentId: string): Promise<StudentPlan[]> {
  const rows = unwrap(
    await supabase.from('student_plan_summary').select('*').eq('student_id', studentId).order('expires_on', { ascending: false }),
  )
  const planIds = [...new Set(rows.flatMap((row) => (row.plan_id ? [row.plan_id] : [])))]
  if (planIds.length === 0) return []

  const [classTypesByPlan, quotasByPlan, validityByPlan, paymentsByStudentPlan, frozenSince] = await Promise.all([
    listPlanClassTypes(planIds),
    listPlanQuotas(planIds),
    listPlanValidity(planIds),
    listPayments(studentId),
    listFrozenSince(studentId),
  ])

  return rows.flatMap((row): StudentPlan[] => {
    if (!row.student_plan_id || !row.plan_id || !row.plan_type || !row.starts_on || !row.expires_on || !row.effective_status) return []
    return [
      {
        id: row.student_plan_id,
        planId: row.plan_id,
        name: row.plan_name ?? 'Plan',
        type: row.plan_type,
        isPrivate: row.is_private ?? false,
        startsOn: row.starts_on,
        expiresOn: row.expires_on,
        status: row.effective_status,
        classesTotal: row.classes_total,
        classesUsed: row.classes_used ?? 0,
        classesRemaining: row.classes_remaining,
        weeklyLimit: row.weekly_limit,
        bookedThisWeek: row.booked_this_week,
        daysToExpire: row.days_to_expire ?? 0,
        isExpiring: row.is_expiring ?? false,
        classTypes: classTypesByPlan.get(row.plan_id) ?? [],
        validity: validityByPlan.get(row.plan_id) ?? 'calendar_month',
        isFrozen: row.is_frozen ?? false,
        frozenAt: frozenSince.get(row.student_plan_id) ?? null,
        frozenDays: row.frozen_days ?? 0,
        quotas: quotasByPlan.get(row.plan_id) ?? [],
        payment: paymentsByStudentPlan.get(row.student_plan_id) ?? null,
      },
    ]
  })
}
