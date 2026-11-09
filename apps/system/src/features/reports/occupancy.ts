import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ClassCategory, ClassType } from '@/features/classes/types'
import type { HeatmapCell, OccupancyBar, OccupancyRow } from './types'

const PERCENT = 100
const NO_CATEGORY_LABEL = 'Sin categoría'

/** Días ISO (1 = lunes). */
export const WEEKDAY_SHORT: Record<number, string> = { 1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 7: 'Dom' }
export const WEEKDAY_PLURAL: Record<number, string> = {
  1: 'lunes',
  2: 'martes',
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábados',
  7: 'domingos',
}

export function formatHour(hour: number): string {
  return format(new Date(2000, 0, 1, hour), 'h a', { locale: es })
}

function toPct(rate: number | null | undefined): number {
  return Math.round(Number(rate ?? 0) * PERCENT)
}

function toBar(row: OccupancyRow): OccupancyBar {
  return {
    id: row.key_id ?? row.label ?? 'unknown',
    label: row.label ?? 'Sin nombre',
    sessions: Number(row.sessions_count),
    booked: Number(row.booked_total),
    capacity: Number(row.capacity_total),
    occupancyPct: toPct(row.occupancy_rate),
    attendancePct: row.attendance_rate === null ? null : toPct(row.attendance_rate),
  }
}

export function getBars(rows: OccupancyRow[], dimension: 'class_type' | 'teacher'): OccupancyBar[] {
  return rows
    .filter((row) => row.dimension === dimension)
    .map(toBar)
    .sort((a, b) => b.occupancyPct - a.occupancyPct)
}

export function getHeatmapCells(rows: OccupancyRow[]): HeatmapCell[] {
  return rows
    .filter((row) => row.dimension === 'weekday_hour' && row.weekday !== null && row.hour !== null)
    .map((row) => ({
      weekday: Number(row.weekday),
      hour: Number(row.hour),
      sessions: Number(row.sessions_count),
      booked: Number(row.booked_total),
      capacity: Number(row.capacity_total),
      occupancyPct: toPct(row.occupancy_rate),
    }))
}

export interface ReportTotals {
  sessions: number
  booked: number
  capacity: number
  occupancyPct: number
  /** Tasa de asistencia ponderada por reservas; null si aún no hay clases realizadas. */
  attendancePct: number | null
}

/** Totales globales a partir de la dimensión por tipo de clase (cubre todas las sesiones una vez). */
export function getTotals(rows: OccupancyRow[]): ReportTotals {
  const types = rows.filter((row) => row.dimension === 'class_type')
  const sessions = types.reduce((sum, row) => sum + Number(row.sessions_count), 0)
  const booked = types.reduce((sum, row) => sum + Number(row.booked_total), 0)
  const capacity = types.reduce((sum, row) => sum + Number(row.capacity_total), 0)
  const rated = types.filter((row) => row.attendance_rate !== null)
  const ratedWeight = rated.reduce((sum, row) => sum + Number(row.booked_total), 0)
  const weightedRate = rated.reduce((sum, row) => sum + Number(row.attendance_rate) * Number(row.booked_total), 0)
  return {
    sessions,
    booked,
    capacity,
    occupancyPct: capacity > 0 ? Math.round((booked / capacity) * PERCENT) : 0,
    attendancePct: ratedWeight > 0 ? toPct(weightedRate / ratedWeight) : null,
  }
}

interface CategoryTotals {
  id: string
  label: string
  color?: string
  sessions: number
  booked: number
  capacity: number
  attendedWeight: number
  attendedBooked: number
}

/**
 * Agrega la ocupación por categoría (Twerk, Urbano…). El reporte llega por tipo de clase, así que se
 * cruza con `class_types.category_id` en el cliente; los estilos sin categoría van aparte.
 */
export function getCategoryBars(
  rows: OccupancyRow[],
  classTypes: Pick<ClassType, 'id' | 'category_id'>[],
  categories: ClassCategory[],
): OccupancyBar[] {
  const categoryOfType = new Map(classTypes.map((type) => [type.id, type.category_id]))
  const categoryById = new Map(categories.map((category) => [category.id, category]))
  const totals = new Map<string, CategoryTotals>()

  for (const row of rows.filter((r) => r.dimension === 'class_type')) {
    const categoryId = (row.key_id ? categoryOfType.get(row.key_id) : null) ?? null
    const category = categoryId ? categoryById.get(categoryId) : undefined
    const id = category?.id ?? 'none'
    const entry = totals.get(id) ?? {
      id,
      label: category?.name ?? NO_CATEGORY_LABEL,
      color: category?.color,
      sessions: 0,
      booked: 0,
      capacity: 0,
      attendedWeight: 0,
      attendedBooked: 0,
    }
    const booked = Number(row.booked_total)
    entry.sessions += Number(row.sessions_count)
    entry.booked += booked
    entry.capacity += Number(row.capacity_total)
    if (row.attendance_rate !== null) {
      entry.attendedWeight += Number(row.attendance_rate) * booked
      entry.attendedBooked += booked
    }
    totals.set(id, entry)
  }

  return [...totals.values()]
    .map((entry) => ({
      id: entry.id,
      label: entry.label,
      color: entry.color,
      sessions: entry.sessions,
      booked: entry.booked,
      capacity: entry.capacity,
      occupancyPct: entry.capacity > 0 ? Math.round((entry.booked / entry.capacity) * PERCENT) : 0,
      attendancePct: entry.attendedBooked > 0 ? toPct(entry.attendedWeight / entry.attendedBooked) : null,
    }))
    .sort((a, b) => b.occupancyPct - a.occupancyPct)
}
