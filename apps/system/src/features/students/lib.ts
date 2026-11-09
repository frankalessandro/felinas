import { differenceInYears } from 'date-fns'
import { academyToday, formatters, fromDateKey } from '@/lib/dates'
import type { PlanSummary } from './types'

export const ADULT_AGE = 18

export function getAge(birthDate: string): number {
  return differenceInYears(academyToday(), fromDateKey(birthDate))
}

export function isMinor(birthDate: string | null): boolean {
  return birthDate !== null && getAge(birthDate) < ADULT_AGE
}

/** Fecha `yyyy-MM-dd` de una columna `date` → "5 oct 2026" sin corrimiento de zona. */
export function formatDateKey(dateKey: string): string {
  return formatters.shortDate(fromDateKey(dateKey))
}

export type PlanWarning = 'no-plan' | 'expiring' | 'low-classes'

const EXPIRING_DAYS = 7
const LOW_CLASSES = 2

export function getPlanWarnings(plan: PlanSummary | null): PlanWarning[] {
  if (!plan) return ['no-plan']
  const warnings: PlanWarning[] = []
  if (plan.days_to_expire !== null && plan.days_to_expire <= EXPIRING_DAYS) warnings.push('expiring')
  if (plan.plan_type === 'package' && plan.classes_remaining !== null && plan.classes_remaining <= LOW_CLASSES) warnings.push('low-classes')
  return warnings
}

export function describeRemaining(plan: PlanSummary): string {
  if (plan.plan_type === 'package') {
    const remaining = plan.classes_remaining ?? 0
    return `${remaining} ${remaining === 1 ? 'clase restante' : 'clases restantes'}`
  }
  return `${plan.weekly_limit ?? 0} por semana`
}

export function describeDaysToExpire(days: number | null): string {
  if (days === null) return ''
  if (days < 0) return 'Vencido'
  if (days === 0) return 'Vence hoy'
  return days === 1 ? 'Vence mañana' : `Vence en ${days} días`
}
