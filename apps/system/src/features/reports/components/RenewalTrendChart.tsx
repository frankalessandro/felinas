import { ColumnChart } from '@/components/charts'
import type { ColumnDatum } from '@/components/charts'
import type { RenewalMonthPoint } from '../types'

/** Tasa de renovación por mes; el último mes con datos va resaltado. */
export function RenewalTrendChart({ points }: { points: RenewalMonthPoint[] }) {
  const lastWithData = points.reduce((last, point, index) => (point.ratePct === null ? last : index), -1)
  const data: ColumnDatum[] = points.map((point, index) => ({
    key: point.key,
    label: point.label,
    value: point.ratePct ?? 0,
    display: point.ratePct === null ? 'Sin planes' : `${point.ratePct}% · ${point.renewed} de ${point.ended}`,
    highlight: index === lastWithData,
  }))
  return <ColumnChart data={data} label="Tasa de renovación por mes" height={170} />
}
