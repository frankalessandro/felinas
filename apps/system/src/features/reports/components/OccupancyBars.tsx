import type { LucideIcon } from 'lucide-react'
import { BarList } from '@/components/charts'
import { EmptyState } from '@/components/ui'
import type { OccupancyBar } from '../types'
import { ReportPanel } from './ReportPanel'

interface OccupancyBarsProps {
  title: string
  description: string
  icon: LucideIcon
  bars: OccupancyBar[]
}

function describe(bar: OccupancyBar): string {
  const base = `${bar.label} · ${bar.sessions} clases · ${bar.booked}/${bar.capacity} cupos`
  return bar.attendancePct === null ? base : `${base} · asistencia ${bar.attendancePct}%`
}

export function OccupancyBars({ title, description, icon, bars }: OccupancyBarsProps) {
  return (
    <ReportPanel title={title} description={description} icon={icon} tone="violeta">
      {bars.length === 0 ? (
        <EmptyState illustration="chart" title="Sin clases en este rango" className="py-8" />
      ) : (
        <BarList
          items={bars.map((bar) => ({
            key: bar.id,
            label: describe(bar),
            value: bar.occupancyPct,
            display: `${bar.occupancyPct}%`,
            color: bar.color ?? 'var(--color-rosa)',
          }))}
        />
      )}
    </ReportPanel>
  )
}
