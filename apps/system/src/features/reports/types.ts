import type { Database } from '@/types/database'

export type OccupancyRow = Database['public']['Functions']['admin_occupancy_report']['Returns'][number]
export type InactiveStudent = Database['public']['Functions']['admin_inactive_students']['Returns'][number]

export type AtRiskStudent = Database['public']['Functions']['admin_at_risk_students']['Returns'][number]
export type RenewalRow = Database['public']['Functions']['admin_renewal_report']['Returns'][number]

export interface DateRange {
  /** yyyy-MM-dd */
  from: string
  to: string
}

/** Fila lista para graficar: ocupación como porcentaje entero. */
export interface OccupancyBar {
  id: string
  label: string
  sessions: number
  booked: number
  capacity: number
  occupancyPct: number
  attendancePct: number | null
  /** Color propio (categoría); si falta la barra usa el degradado de marca. */
  color?: string
}

export interface HeatmapCell {
  weekday: number
  hour: number
  sessions: number
  booked: number
  capacity: number
  occupancyPct: number
}

export interface RenewalMonthPoint {
  /** yyyy-MM */
  key: string
  label: string
  ended: number
  renewed: number
  /** Entero 0–100; null si ese mes no terminó ningún plan. */
  ratePct: number | null
}

export interface RenewalPlanRow {
  id: string
  label: string
  ended: number
  renewed: number
  ratePct: number
}

export type InsightTone = 'ok' | 'warn' | 'info'

export interface Insight {
  id: string
  tone: InsightTone
  text: string
}
