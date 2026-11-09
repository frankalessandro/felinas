import { formatCOP as formatMoney } from '@/lib/money'
import type { ClassCategory, Plan, PlanCategoryQuota } from './types'

export function formatCOP(amount: number | null): string {
  return amount === null ? 'Precio por definir' : formatMoney(amount)
}

type PlanDescribable = Pick<Plan, 'type' | 'class_count' | 'weekly_limit' | 'duration_days' | 'validity'>

/** "8 clases · por mes" / "8 clases · 30 días" para paquetes, "2 por semana · …" para mensualidades. */
export function describePlan(plan: PlanDescribable): string {
  const span = plan.validity === 'calendar_month' ? 'por mes' : `${plan.duration_days} días`
  if (plan.type === 'package') {
    const count = plan.class_count ?? 0
    return `${count} ${count === 1 ? 'clase' : 'clases'} · ${span}`
  }
  return `${plan.weekly_limit ?? 0} por semana · ${span}`
}

/** "3 Twerk + 1 Urbano", o `null` si el plan no reparte cupos por categoría. */
export function describeQuotas(quotas: PlanCategoryQuota[], categories: ClassCategory[]): string | null {
  const parts = [...categories]
    .sort((a, b) => a.sort_order - b.sort_order)
    .flatMap((category) => {
      const quota = quotas.find((item) => item.category_id === category.id)
      return quota ? [`${quota.max_classes} ${category.name}`] : []
    })
  return parts.length > 0 ? parts.join(' + ') : null
}
