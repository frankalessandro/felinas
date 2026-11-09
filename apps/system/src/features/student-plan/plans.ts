import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { fromDateKey } from '@/lib/dates'
import type { PlanClassType, StudentPlan } from './types'

export const LOW_CLASSES_THRESHOLD = 2
export const EXPIRING_DAYS_THRESHOLD = 7

export type PlanAlertTone = 'dorado' | 'danger'

export interface PlanAlert {
  id: string
  tone: PlanAlertTone
  title: string
  description: string
}

export const PLAN_TYPE_LABEL = {
  package: 'Paquete de clases',
  monthly: 'Mensualidad',
} as const satisfies Record<StudentPlan['type'], string>

export function isPlanActive(plan: StudentPlan): boolean {
  return plan.status === 'active' && plan.daysToExpire >= 0
}

/** Planes vigentes, el que vence primero arriba (es el que la base consume primero). */
export function getActivePlans(plans: StudentPlan[]): StudentPlan[] {
  return plans.filter(isPlanActive).sort((a, b) => a.expiresOn.localeCompare(b.expiresOn))
}

export function getActiveGroupPlans(plans: StudentPlan[]): StudentPlan[] {
  return getActivePlans(plans).filter((plan) => !plan.isPrivate)
}

export function getPastPlans(plans: StudentPlan[]): StudentPlan[] {
  return plans.filter((plan) => !isPlanActive(plan))
}

/** Tipos de clase que la alumna puede reservar con sus planes grupales vigentes. */
export function getAllowedClassTypes(plans: StudentPlan[]): PlanClassType[] {
  const byId = new Map<string, PlanClassType>()
  for (const plan of getActiveGroupPlans(plans)) {
    for (const type of plan.classTypes) byId.set(type.id, type)
  }
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name, 'es'))
}

export function describeDaysLeft(days: number): string {
  if (days <= 0) return 'hoy'
  if (days === 1) return 'mañana'
  return `en ${days} días`
}

export function describeClassesLeft(remaining: number): string {
  if (remaining <= 0) return 'Ya no te quedan clases'
  if (remaining === 1) return 'Te queda 1 clase'
  return `Te quedan ${remaining} clases`
}

/** Avisos que la alumna debe ver: plan por vencer y/o pocas clases. */
export function getPlanAlerts(plan: StudentPlan): PlanAlert[] {
  if (!isPlanActive(plan) || !plan.isExpiring) return []
  const alerts: PlanAlert[] = []

  if (plan.daysToExpire <= EXPIRING_DAYS_THRESHOLD) {
    alerts.push({
      id: `${plan.id}-expiry`,
      tone: plan.daysToExpire <= 1 ? 'danger' : 'dorado',
      title: plan.daysToExpire <= 0 ? 'Tu plan vence hoy' : `Tu plan vence ${describeDaysLeft(plan.daysToExpire)}`,
      description: `${plan.name}: habla con la academia para renovarlo y seguir reservando.`,
    })
  }
  if (plan.classesRemaining !== null && plan.classesRemaining <= LOW_CLASSES_THRESHOLD) {
    alerts.push({
      id: `${plan.id}-classes`,
      tone: plan.classesRemaining === 0 ? 'danger' : 'dorado',
      title: describeClassesLeft(plan.classesRemaining),
      description: `${plan.name}: renueva a tiempo para no quedarte sin cupo.`,
    })
  }
  return alerts
}

/** Cuántas clases del paquete siguen libres para reservar (descontando las ya reservadas). */
export function getBookableClasses(plan: StudentPlan, reserved: number): number | null {
  if (plan.classesRemaining === null) return null
  return Math.max(plan.classesRemaining - reserved, 0)
}

/** Mes del plan (por el mes de `starts_on`: la congelación puede empujar el vencimiento al mes siguiente). */
export function getPlanMonthName(plan: StudentPlan): string {
  return format(fromDateKey(plan.startsOn), 'MMMM', { locale: es })
}

/** "Tu plan de octubre" para planes de mes calendario; el nombre del plan para los demás. */
export function getPlanHeading(plan: StudentPlan): string {
  return plan.validity === 'calendar_month' ? `Tu plan de ${getPlanMonthName(plan)}` : 'Tu plan'
}
