import type { Enums } from '@/types/database'

export type PlanType = Enums<'plan_type'>
export type StudentPlanStatus = Enums<'student_plan_status'>
export type PlanValidity = Enums<'plan_validity'>
export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'free'

export interface PlanClassType {
  id: string
  name: string
  color: string
  /** Categoría del estilo (Twerk, Urbano…), base de los cupos por categoría. */
  categoryId: string | null
}

/** Máximo de clases de una categoría dentro de un plan (ej. Twerk 3). */
export interface PlanQuota {
  categoryId: string
  name: string
  color: string
  max: number
}

export interface PlanPayment {
  status: PaymentStatus
  price: number
  paid: number
  balance: number
}

/** Plan de una alumna ya normalizado: sin nulos que la vista de la base deja como opcionales. */
export interface StudentPlan {
  id: string
  planId: string
  name: string
  type: PlanType
  isPrivate: boolean
  /** `yyyy-MM-dd` */
  startsOn: string
  /** `yyyy-MM-dd`, último día válido. */
  expiresOn: string
  status: StudentPlanStatus
  classesTotal: number | null
  classesUsed: number
  classesRemaining: number | null
  weeklyLimit: number | null
  bookedThisWeek: number | null
  daysToExpire: number
  isExpiring: boolean
  classTypes: PlanClassType[]
  validity: PlanValidity
  isFrozen: boolean
  /** `timestamptz` ISO del momento en que se congeló, si lo está. */
  frozenAt: string | null
  frozenDays: number
  quotas: PlanQuota[]
  /** Null si la base aún no tiene fila de saldo para el plan. */
  payment: PlanPayment | null
}
