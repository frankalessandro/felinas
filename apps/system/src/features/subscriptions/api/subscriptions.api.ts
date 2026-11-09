import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import { toPaymentStatus } from '@/features/payments/constants'
import { monthEnd, monthStart } from '../months'
import type { MonthKey } from '../months'
import type { OutstandingBalance, RevenueReport, RevenueSlice, StudentPlanRow, SubscriptionBucket, SubscriptionRow } from '../types'
import { SUBSCRIPTION_BUCKETS } from '../types'

function toBucket(value: string): SubscriptionBucket {
  return SUBSCRIPTION_BUCKETS.find((bucket) => bucket === value) ?? 'ok'
}

export async function getSubscriptionsOverview(month: MonthKey): Promise<SubscriptionRow[]> {
  const rows = unwrap(await supabase.rpc('admin_subscriptions_overview', { p_month: monthStart(month) }))
  // La función devuelve null en las columnas del plan cuando la alumna no tiene plan ese mes.
  return rows.map((row) => ({
    studentId: row.student_id,
    fullName: row.full_name ?? 'Sin nombre',
    avatarUrl: row.avatar_url ?? null,
    phone: row.phone ?? null,
    studentPlanId: row.student_plan_id ?? null,
    planId: row.plan_id ?? null,
    planName: row.plan_name ?? null,
    price: row.price ?? null,
    paid: row.paid ?? 0,
    balance: row.balance ?? null,
    paymentStatus: toPaymentStatus(row.payment_status),
    classesTotal: row.classes_total ?? null,
    classesUsed: row.classes_used ?? null,
    classesRemaining: row.classes_remaining ?? null,
    expiresOn: row.expires_on ?? null,
    isFrozen: row.is_frozen ?? false,
    prevStudentPlanId: row.prev_student_plan_id ?? null,
    prevPlanName: row.prev_plan_name ?? null,
    lastPaymentOn: row.last_payment_on ?? null,
    lastAttendedAt: row.last_attended_at ?? null,
    bucket: toBucket(row.bucket),
  }))
}

function toSlices(rows: { dimension: string; key: string; label: string; amount: number; payments_count: number }[], dimension: string) {
  return rows
    .filter((row) => row.dimension === dimension)
    .map<RevenueSlice>((row) => ({ key: row.key, label: row.label, amount: row.amount, count: row.payments_count }))
    .sort((a, b) => b.amount - a.amount)
}

/** Ingresos de un mes calendario. Una sola fila `month` aparece porque el rango es de un mes. */
export async function getMonthRevenue(month: MonthKey): Promise<RevenueReport> {
  const rows = unwrap(await supabase.rpc('admin_revenue_report', { p_from: monthStart(month), p_to: monthEnd(month) }))
  const monthRows = toSlices(rows, 'month')
  return {
    total: monthRows.reduce((sum, row) => sum + row.amount, 0),
    count: monthRows.reduce((sum, row) => sum + row.count, 0),
    byMethod: toSlices(rows, 'method'),
    byPlan: toSlices(rows, 'plan'),
  }
}

export async function getOutstandingBalance(): Promise<OutstandingBalance> {
  const [row] = unwrap(await supabase.rpc('admin_outstanding_balance'))
  return { total: row?.total ?? 0, students: row?.students ?? 0 }
}

export async function getStudentPlanRow(studentPlanId: string): Promise<StudentPlanRow> {
  return unwrap(await supabase.from('student_plans').select('*').eq('id', studentPlanId).single())
}

/** El mes y el vencimiento los calcula la RPC; `price` solo se envía cuando Mae lo cambia. */
export async function renewPlan(studentPlanId: string, price?: number): Promise<StudentPlanRow> {
  return unwrap(await supabase.rpc('renew_plan', { p_student_plan_id: studentPlanId, p_price: price }))
}

/** Devuelve cuántos planes creó; los ya renovados se omiten. */
export async function renewPlansBulk(studentPlanIds: string[], month: MonthKey): Promise<number> {
  return unwrap(await supabase.rpc('renew_plans_bulk', { p_student_plan_ids: studentPlanIds, p_month: monthStart(month) }))
}

export async function freezePlan(studentPlanId: string, reason: string | null): Promise<StudentPlanRow> {
  return unwrap(await supabase.rpc('freeze_plan', { p_student_plan_id: studentPlanId, p_reason: reason ?? undefined }))
}

export async function unfreezePlan(studentPlanId: string): Promise<StudentPlanRow> {
  return unwrap(await supabase.rpc('unfreeze_plan', { p_student_plan_id: studentPlanId }))
}

/** Devuelve cuántas clases creó (0 si el mes ya estaba generado). */
export async function generateMonthSessions(month: MonthKey): Promise<number> {
  return unwrap(await supabase.rpc('generate_month_sessions', { p_month: monthStart(month) }))
}
