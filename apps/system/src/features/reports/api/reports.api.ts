import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { AtRiskStudent, DateRange, InactiveStudent, OccupancyRow, RenewalRow } from '../types'

export const DEFAULT_INACTIVE_DAYS = 14
export const DEFAULT_AT_RISK_DAYS = 10
export const DEFAULT_RENEWAL_MONTHS = 6

export async function getOccupancyReport(range: DateRange): Promise<OccupancyRow[]> {
  return unwrap(await supabase.rpc('admin_occupancy_report', { p_from: range.from, p_to: range.to }))
}

export async function listInactiveStudents(days = DEFAULT_INACTIVE_DAYS): Promise<InactiveStudent[]> {
  return unwrap(await supabase.rpc('admin_inactive_students', { p_days: days }))
}

export async function listAtRiskStudents(days = DEFAULT_AT_RISK_DAYS): Promise<AtRiskStudent[]> {
  return unwrap(await supabase.rpc('admin_at_risk_students', { p_days: days }))
}

export async function getRenewalReport(months = DEFAULT_RENEWAL_MONTHS): Promise<RenewalRow[]> {
  return unwrap(await supabase.rpc('admin_renewal_report', { p_months: months }))
}
