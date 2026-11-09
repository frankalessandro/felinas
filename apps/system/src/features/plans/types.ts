import type { Enums, Tables } from '@/types/database'

export type Plan = Tables<'plans'>
export type PlanType = Enums<'plan_type'>

export type PlanValidity = Enums<'plan_validity'>
export type ClassCategory = Tables<'class_categories'>

export interface PlanCategoryQuota {
  category_id: string
  max_classes: number
}

export type PlanWithClassTypes = Plan & {
  plan_class_types: { class_type_id: string }[]
  plan_category_quotas: PlanCategoryQuota[]
}
