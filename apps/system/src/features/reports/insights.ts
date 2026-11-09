import { WEEKDAY_PLURAL, formatHour } from './occupancy'
import type { ReportTotals } from './occupancy'
import type { HeatmapCell, Insight, OccupancyBar } from './types'

/** Umbrales: por debajo/encima de estos porcentajes una franja se considera floja o llena. */
export const LOW_OCCUPANCY_PCT = 35
export const FULL_OCCUPANCY_PCT = 90
export const STAR_OCCUPANCY_PCT = 70
export const LOW_ATTENDANCE_PCT = 70
/** Diferencia mínima (puntos) entre el mejor y el peor día para señalar el más flojo. */
export const WEEKDAY_GAP_PTS = 20
/** Razón mínima entre categorías para decir que una llena más que otra. */
export const CATEGORY_RATIO = 1.5
/** Mínimo de clases dadas para no opinar sobre una sola clase suelta. */
export const MIN_SESSIONS = 2
const MAX_INSIGHTS = 6
const PERCENT = 100
const DOUBLE_MIN = 1.8
const DOUBLE_MAX = 2.2

export interface InsightInput {
  weekdayHourCells: HeatmapCell[]
  classTypeBars: OccupancyBar[]
  categoryBars: OccupancyBar[]
  totals: ReportTotals
}

interface WeekdayStat {
  weekday: number
  pct: number
}

function pct(booked: number, capacity: number): number {
  return capacity > 0 ? Math.round((booked / capacity) * PERCENT) : 0
}

/** Ocupación por día de la semana, de más a menos llena; ignora días con muy pocas clases. */
export function getWeekdayStats(cells: HeatmapCell[]): WeekdayStat[] {
  const byDay = new Map<number, { booked: number; capacity: number; sessions: number }>()
  for (const cell of cells) {
    const entry = byDay.get(cell.weekday) ?? { booked: 0, capacity: 0, sessions: 0 }
    entry.booked += cell.booked
    entry.capacity += cell.capacity
    entry.sessions += cell.sessions
    byDay.set(cell.weekday, entry)
  }
  return [...byDay.entries()]
    .filter(([, entry]) => entry.capacity > 0 && entry.sessions >= MIN_SESSIONS)
    .map(([weekday, entry]) => ({ weekday, pct: pct(entry.booked, entry.capacity) }))
    .sort((a, b) => b.pct - a.pct)
}

function weekdayInsights(cells: HeatmapCell[]): Insight[] {
  const stats = getWeekdayStats(cells)
  const best = stats[0]
  const worst = stats[stats.length - 1]
  if (!best || !worst || stats.length < 2) return []
  const insights: Insight[] = [
    { id: 'best-weekday', tone: 'ok', text: `Los ${WEEKDAY_PLURAL[best.weekday]} son tu día más lleno (${best.pct}%).` },
  ]
  if (best.pct - worst.pct >= WEEKDAY_GAP_PTS) {
    insights.push({ id: 'worst-weekday', tone: 'warn', text: `Los ${WEEKDAY_PLURAL[worst.weekday]} son el día más flojo (${worst.pct}%).` })
  }
  return insights
}

function slotInsights(cells: HeatmapCell[]): Insight[] {
  const solid = cells.filter((cell) => cell.sessions >= MIN_SESSIONS)
  const low = solid.filter((cell) => cell.occupancyPct < LOW_OCCUPANCY_PCT).sort((a, b) => a.occupancyPct - b.occupancyPct)[0]
  const full = solid.filter((cell) => cell.occupancyPct >= FULL_OCCUPANCY_PCT).sort((a, b) => b.occupancyPct - a.occupancyPct)[0]
  const insights: Insight[] = []
  if (full) {
    insights.push({
      id: 'full-slot',
      tone: 'ok',
      text: `Los ${WEEKDAY_PLURAL[full.weekday]} a las ${formatHour(full.hour)} se llenan (${full.occupancyPct}%): candidata para abrir otro grupo.`,
    })
  }
  if (low) {
    insights.push({
      id: 'low-slot',
      tone: 'warn',
      text: `Los ${WEEKDAY_PLURAL[low.weekday]} a las ${formatHour(low.hour)} van al ${low.occupancyPct}%: considera moverla de horario.`,
    })
  }
  return insights
}

function classTypeInsights(bars: OccupancyBar[]): Insight[] {
  const solid = bars.filter((bar) => bar.sessions >= MIN_SESSIONS && bar.capacity > 0)
  const best = solid[0]
  const worst = solid[solid.length - 1]
  const insights: Insight[] = []
  if (best && best.occupancyPct >= STAR_OCCUPANCY_PCT) {
    insights.push({ id: 'star-class', tone: 'ok', text: `${best.label} es tu clase estrella: ${best.occupancyPct}% de ocupación.` })
  }
  if (worst && worst !== best && worst.occupancyPct < LOW_OCCUPANCY_PCT) {
    insights.push({ id: 'weak-class', tone: 'warn', text: `${worst.label} va al ${worst.occupancyPct}%: vale la pena promocionarla o replantearla.` })
  }
  return insights
}

function describeRatio(ratio: number, top: string, bottom: string): string {
  if (ratio >= DOUBLE_MIN && ratio <= DOUBLE_MAX) return `${top} llena el doble que ${bottom}.`
  return `${top} llena un ${Math.round((ratio - 1) * PERCENT)}% más que ${bottom}.`
}

function categoryInsights(bars: OccupancyBar[]): Insight[] {
  const solid = bars.filter((bar) => bar.sessions >= MIN_SESSIONS && bar.occupancyPct > 0)
  const top = solid[0]
  const bottom = solid[solid.length - 1]
  if (!top || !bottom || top === bottom) return []
  const ratio = top.occupancyPct / bottom.occupancyPct
  if (ratio < CATEGORY_RATIO) return []
  return [{ id: 'category-gap', tone: 'info', text: describeRatio(ratio, top.label, bottom.label) }]
}

function attendanceInsights(totals: ReportTotals): Insight[] {
  if (totals.attendancePct === null || totals.attendancePct >= LOW_ATTENDANCE_PCT) return []
  return [
    {
      id: 'low-attendance',
      tone: 'warn',
      text: `Solo el ${totals.attendancePct}% de las reservas termina asistiendo: un recordatorio el día anterior puede ayudar.`,
    },
  ]
}

/** Conclusiones en español a partir del reporte. Solo funciones puras: fáciles de probar. */
export function buildInsights(input: InsightInput): Insight[] {
  return [
    ...weekdayInsights(input.weekdayHourCells),
    ...categoryInsights(input.categoryBars),
    ...slotInsights(input.weekdayHourCells),
    ...classTypeInsights(input.classTypeBars),
    ...attendanceInsights(input.totals),
  ].slice(0, MAX_INSIGHTS)
}
