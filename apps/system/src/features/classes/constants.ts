import type { SelectOption } from '@/components/ui'
import type { ClassLevel } from './types'

/** Weekday ISO como en la base: 1 = lunes … 7 = domingo. */
export const WEEKDAYS = [
  { value: 1, label: 'Lunes', short: 'Lun' },
  { value: 2, label: 'Martes', short: 'Mar' },
  { value: 3, label: 'Miércoles', short: 'Mié' },
  { value: 4, label: 'Jueves', short: 'Jue' },
  { value: 5, label: 'Viernes', short: 'Vie' },
  { value: 6, label: 'Sábado', short: 'Sáb' },
  { value: 7, label: 'Domingo', short: 'Dom' },
] as const

export const WEEKDAY_OPTIONS: SelectOption[] = WEEKDAYS.map((day) => ({ value: String(day.value), label: day.label }))

export function getWeekdayShort(weekday: number): string {
  return WEEKDAYS.find((day) => day.value === weekday)?.short ?? ''
}

export const LEVEL_LABELS: Record<ClassLevel, string> = {
  all: 'Todos los niveles',
  beginner: 'Principiante',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
}

export const LEVEL_OPTIONS: SelectOption[] = (Object.keys(LEVEL_LABELS) as ClassLevel[]).map((level) => ({
  value: level,
  label: LEVEL_LABELS[level],
}))

/** Radix Select no admite valores vacíos: este centinela representa "sin salón". */
export const NO_ROOM = 'none'

export const DEFAULT_CLASS_COLOR = '#ff2e7e'
