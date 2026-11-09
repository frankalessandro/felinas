import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import { rpcArgs } from '@/lib/rpc'
import type { PlanFormData } from '../schemas'
import type { ClassCategory, Plan, PlanWithClassTypes } from '../types'

export async function listPlans(): Promise<PlanWithClassTypes[]> {
  return unwrap(
    await supabase.from('plans').select('*, plan_class_types ( class_type_id ), plan_category_quotas ( category_id, max_classes )').is('deleted_at', null).order('created_at', { ascending: false }),
  )
}

/** El plan y sus estilos se guardan en una sola transacción (RPC `save_plan`). */
async function savePlan(planId: string | null, data: PlanFormData): Promise<Plan> {
  return unwrap(
    await supabase.rpc(
      'save_plan',
      rpcArgs('save_plan', {
      p_plan_id: planId,
      p_name: data.name,
      p_description: data.description,
      p_type: data.type,
      p_class_count: data.class_count,
      p_weekly_limit: data.weekly_limit,
      p_duration_days: data.duration_days,
      p_price: data.price,
      p_is_private: data.is_private,
      p_active: data.active,
      p_class_type_ids: data.class_type_ids,
      p_category_quotas: data.category_quotas,
      p_validity: data.validity,
      }),
    ),
  )
}

export async function listCategories(): Promise<ClassCategory[]> {
  return unwrap(await supabase.from('class_categories').select('*').order('sort_order'))
}

export function createPlan(data: PlanFormData): Promise<Plan> {
  return savePlan(null, data)
}

export function updatePlan(id: string, data: PlanFormData): Promise<Plan> {
  return savePlan(id, data)
}

/** Borrado lógico: las alumnas que ya tienen el plan conservan su historial. */
export async function archivePlan(id: string): Promise<Plan> {
  const patch = { active: false, deleted_at: new Date().toISOString() }
  return unwrap(await supabase.from('plans').update(patch).eq('id', id).select().single())
}
