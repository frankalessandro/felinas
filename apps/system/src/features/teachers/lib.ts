import type { TeacherStyle, TeacherWithSchedules } from './types'

export const DEFAULT_TEACHER_COLOR = '#ff2e7e'

export function getTeacherColor(teacher: Pick<TeacherWithSchedules, 'color'>): string {
  return teacher.color ?? DEFAULT_TEACHER_COLOR
}

/** Estilos que dicta la profe, derivados de sus horarios activos (sin duplicados). */
export function getTeacherStyles(teacher: TeacherWithSchedules): TeacherStyle[] {
  const styles = new Map<string, TeacherStyle>()
  for (const schedule of teacher.schedules) {
    const type = schedule.class_type
    if (!schedule.active || !type || styles.has(type.id)) continue
    styles.set(type.id, { id: type.id, name: type.name, color: type.color })
  }
  return [...styles.values()]
}

export function getInstagramUrl(handle: string): string {
  return `https://instagram.com/${handle}`
}

export interface TeacherWeekDay {
  weekday: number
  letter: string
  label: string
  /** Horarios activos ese día. */
  classes: number
}

/** Domingo a sábado, como los calendarios. */
const WEEK_DAYS = [
  { weekday: 7, letter: 'D', label: 'domingo' },
  { weekday: 1, letter: 'L', label: 'lunes' },
  { weekday: 2, letter: 'M', label: 'martes' },
  { weekday: 3, letter: 'M', label: 'miércoles' },
  { weekday: 4, letter: 'J', label: 'jueves' },
  { weekday: 5, letter: 'V', label: 'viernes' },
  { weekday: 6, letter: 'S', label: 'sábado' },
] as const

export function getTeacherWeek(teacher: TeacherWithSchedules): TeacherWeekDay[] {
  const active = teacher.schedules.filter((schedule) => schedule.active)
  return WEEK_DAYS.map((day) => ({ ...day, classes: active.filter((schedule) => schedule.weekday === day.weekday).length }))
}
