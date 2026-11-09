import { format, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'
import { academyToday } from '@/lib/dates'
import type { RenewalMonthPoint, RenewalPlanRow, RenewalRow } from './types'

const PERCENT = 100
/** Con menos planes terminados que esto, una tasa no es representativa para destacarla. */
export const MIN_ENDED_FOR_HIGHLIGHT = 3

function toPct(rate: number | null): number | null {
  return rate === null ? null : Math.round(Number(rate) * PERCENT)
}

/** Los últimos `months` meses completos (sin el actual), del más viejo al más reciente, aunque un mes no tenga datos. */
export function getMonthPoints(rows: RenewalRow[], months: number): RenewalMonthPoint[] {
  const byKey = new Map(rows.filter((row) => row.dimension === 'month').map((row) => [row.key, row]))
  const today = academyToday()
  return Array.from({ length: months }, (_, index) => {
    const date = subMonths(today, months - index)
    const key = format(date, 'yyyy-MM')
    const row = byKey.get(key)
    return {
      key,
      label: format(date, 'MMM', { locale: es }),
      ended: Number(row?.ended ?? 0),
      renewed: Number(row?.renewed ?? 0),
      ratePct: toPct(row?.renewal_rate ?? null),
    }
  })
}

export function getPlanRows(rows: RenewalRow[]): RenewalPlanRow[] {
  return rows
    .filter((row) => row.dimension === 'plan')
    .map((row) => ({
      id: row.key,
      label: row.label,
      ended: Number(row.ended),
      renewed: Number(row.renewed),
      ratePct: toPct(row.renewal_rate) ?? 0,
    }))
    .sort((a, b) => b.ratePct - a.ratePct || b.ended - a.ended)
}

export interface RenewalHeadline {
  ended: number
  renewed: number
  ratePct: number | null
  /** Variación en puntos del último mes con datos frente al anterior con datos; null si no hay dos. */
  deltaPts: number | null
}

export function getHeadline(points: RenewalMonthPoint[]): RenewalHeadline {
  const ended = points.reduce((sum, point) => sum + point.ended, 0)
  const renewed = points.reduce((sum, point) => sum + point.renewed, 0)
  const withData = points.filter((point) => point.ratePct !== null)
  const last = withData[withData.length - 1]?.ratePct ?? null
  const previous = withData[withData.length - 2]?.ratePct ?? null
  return {
    ended,
    renewed,
    ratePct: ended > 0 ? Math.round((renewed / ended) * PERCENT) : null,
    deltaPts: last !== null && previous !== null ? last - previous : null,
  }
}

/** Mejor y peor plan entre los que tienen suficiente muestra; null si no hay dos comparables. */
export function getPlanHighlights(plans: RenewalPlanRow[]): { bestId: string; worstId: string } | null {
  const comparable = plans.filter((plan) => plan.ended >= MIN_ENDED_FOR_HIGHLIGHT)
  const best = comparable[0]
  const worst = comparable[comparable.length - 1]
  if (!best || !worst || best.id === worst.id || best.ratePct === worst.ratePct) return null
  return { bestId: best.id, worstId: worst.id }
}
