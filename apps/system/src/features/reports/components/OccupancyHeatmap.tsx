import { Grid3x3 } from 'lucide-react'
import type { CSSProperties } from 'react'
import { EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { FULL_OCCUPANCY_PCT, LOW_OCCUPANCY_PCT, getWeekdayStats } from '../insights'
import { WEEKDAY_SHORT, formatHour } from '../occupancy'
import type { HeatmapCell } from '../types'
import { ReportPanel } from './ReportPanel'

const MIN_TINT = 8
const MAX_TINT = 85
/** Sobre este porcentaje el fondo es lo bastante rosa como para llevar texto blanco con buen contraste. */
const LIGHT_TEXT_FROM_PCT = 55

/** Escala secuencial de un solo matiz: más rosa, más ocupación. */
function cellStyle(cell: HeatmapCell): CSSProperties {
  const tint = Math.max(MIN_TINT, Math.min(MAX_TINT, cell.occupancyPct))
  return { backgroundColor: `color-mix(in srgb, var(--color-rosa) ${tint}%, var(--color-surface-2))` }
}

function buildAxes(cells: HeatmapCell[]) {
  const weekdays = [...new Set(cells.map((c) => c.weekday))].sort((a, b) => a - b)
  const hours = [...new Set(cells.map((c) => c.hour))].sort((a, b) => a - b)
  return { weekdays, hours }
}

function describeCell(cell: HeatmapCell): string {
  return `${WEEKDAY_SHORT[cell.weekday]} ${formatHour(cell.hour)}: ${cell.occupancyPct}% de ocupación, ${cell.booked} de ${cell.capacity} cupos en ${cell.sessions} clases`
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-fg-muted" aria-hidden>
      <span className="inline-flex items-center gap-2">
        0%
        <span className="h-2.5 w-28 rounded-full" style={{ backgroundImage: 'linear-gradient(90deg, var(--color-surface-2), var(--color-rosa))' }} />
        100%
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-[4px] ring-2 ring-ambar" /> Llena (≥{FULL_OCCUPANCY_PCT}%)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-3 rounded-[4px] border border-dashed border-warn" /> Floja (&lt;{LOW_OCCUPANCY_PCT}%)
      </span>
    </div>
  )
}

export function OccupancyHeatmap({ cells }: { cells: HeatmapCell[] }) {
  const { weekdays, hours } = buildAxes(cells)
  const byKey = new Map(cells.map((c) => [`${c.weekday}-${c.hour}`, c]))
  const dayAverage = new Map(getWeekdayStats(cells).map((stat) => [stat.weekday, stat.pct]))

  return (
    <ReportPanel
      title="Mapa de horarios"
      description="Cuánto se llena cada franja: más color, más ocupación. El borde ámbar marca las que se llenan."
      icon={Grid3x3}
    >
      {cells.length === 0 ? (
        <EmptyState illustration="calendar" title="Sin clases en este rango" className="py-8" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-separate border-spacing-1 text-center">
              <caption className="sr-only">Ocupación por día de la semana y hora</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-14" />
                  {weekdays.map((weekday) => (
                    <th key={weekday} scope="col" className="pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                      {WEEKDAY_SHORT[weekday]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hours.map((hour) => (
                  <tr key={hour}>
                    <th scope="row" className="pr-2 text-right text-xs font-medium tabular-nums text-fg-subtle">
                      {formatHour(hour)}
                    </th>
                    {weekdays.map((weekday) => {
                      const cell = byKey.get(`${weekday}-${hour}`)
                      if (!cell) return <td key={weekday} aria-label="Sin clases" className="h-11 rounded-lg border border-dashed border-line" />
                      const full = cell.occupancyPct >= FULL_OCCUPANCY_PCT
                      const low = cell.occupancyPct < LOW_OCCUPANCY_PCT
                      return (
                        <td
                          key={weekday}
                          style={cellStyle(cell)}
                          title={describeCell(cell)}
                          aria-label={describeCell(cell)}
                          className={cn(
                            'h-11 rounded-lg font-display text-sm font-bold tabular-nums transition-transform hover:scale-105 motion-reduce:transition-none',
                            cell.occupancyPct >= LIGHT_TEXT_FROM_PCT ? 'text-white' : 'text-fg',
                            full && 'ring-2 ring-ambar',
                            low && 'border border-dashed border-warn',
                          )}
                        >
                          {cell.occupancyPct}%
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" className="pr-2 pt-1 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                    Día
                  </th>
                  {weekdays.map((weekday) => (
                    <td key={weekday} className="pt-1 font-display text-sm font-bold tabular-nums text-rosa-hover">
                      {dayAverage.has(weekday) ? `${dayAverage.get(weekday)}%` : '—'}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <Legend />
        </>
      )}
    </ReportPanel>
  )
}
