import { TZDate } from '@date-fns/tz'
import {
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfDay,
  startOfMonth,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns'
import { es } from 'date-fns/locale'

/** Toda fecha se muestra en hora de la academia, sin importar dónde esté el dispositivo. */
export const ACADEMY_TZ = 'America/Bogota'

/** Calendarios: la semana se muestra de domingo a sábado. */
const WEEK_OPTIONS = { weekStartsOn: 0 } as const
/** Reglas de negocio (límite semanal, rachas): semana ISO de lunes a domingo, como en la base. */
const BUSINESS_WEEK_OPTIONS = { weekStartsOn: 1 } as const

export function toAcademyTime(date: Date | string): TZDate {
  return new TZDate(new Date(date), ACADEMY_TZ)
}

export function academyNow(): TZDate {
  return TZDate.tz(ACADEMY_TZ)
}

export function academyToday(): TZDate {
  return startOfDay(academyNow())
}

export function getWeekStart(date: Date): TZDate {
  return startOfWeek(toAcademyTime(date), WEEK_OPTIONS)
}

/** Inicio (lunes) de la semana para reglas de plan e historial; no depende de cómo se pinta el calendario. */
export function getBusinessWeekStart(date: Date): TZDate {
  return startOfWeek(toAcademyTime(date), BUSINESS_WEEK_OPTIONS)
}

export function getWeekDays(weekStart: Date): TZDate[] {
  const start = toAcademyTime(weekStart)
  return eachDayOfInterval({ start, end: endOfWeek(start, WEEK_OPTIONS) }).map((d) => toAcademyTime(d))
}

/** Rango [inicio, fin) de la semana en ISO UTC, listo para filtrar `starts_at` en Supabase. */
export function getWeekRange(weekStart: Date): { from: string; to: string } {
  const start = getWeekStart(weekStart)
  return { from: start.toISOString(), to: addDays(start, 7).toISOString() }
}

/** Días que pinta la vista mensual: semanas completas (dom–sáb) que cubren el mes. */
export function getMonthGridDays(date: Date): TZDate[] {
  const local = toAcademyTime(date)
  const start = startOfWeek(startOfMonth(local), WEEK_OPTIONS)
  const end = endOfWeek(endOfMonth(local), WEEK_OPTIONS)
  return eachDayOfInterval({ start, end }).map((d) => toAcademyTime(d))
}

export type CalendarViewMode = 'month' | 'week'

/** Rango [inicio, fin) en ISO UTC de lo que muestra el calendario en esa vista. */
export function getCalendarRange(view: CalendarViewMode, date: Date): { from: string; to: string } {
  if (view === 'week') return getWeekRange(date)
  const days = getMonthGridDays(date)
  const first = days[0] ?? toAcademyTime(date)
  const last = days[days.length - 1] ?? first
  return { from: startOfDay(first).toISOString(), to: addDays(startOfDay(last), 1).toISOString() }
}

export function isSameAcademyMonth(a: Date | string, b: Date | string): boolean {
  return isSameMonth(toAcademyTime(a), toAcademyTime(b))
}

export function isSameAcademyDay(a: Date | string, b: Date | string): boolean {
  return isSameDay(toAcademyTime(a), toAcademyTime(b))
}

export function daysUntil(date: Date | string): number {
  return differenceInCalendarDays(toAcademyTime(date), academyToday())
}

/** `yyyy-MM-dd` en hora de la academia: formato de search params y columnas `date`. */
export function toDateKey(date: Date | string): string {
  return format(toAcademyTime(date), 'yyyy-MM-dd')
}

export function fromDateKey(key: string): TZDate {
  const [y, m, d] = key.split('-').map(Number)
  return new TZDate(y ?? 1970, (m ?? 1) - 1, d ?? 1, ACADEMY_TZ)
}

export const formatters = {
  time: (d: Date | string) => format(toAcademyTime(d), 'h:mm a', { locale: es }),
  timeRange: (a: Date | string, b: Date | string) =>
    `${format(toAcademyTime(a), 'h:mm', { locale: es })} – ${format(toAcademyTime(b), 'h:mm a', { locale: es })}`,
  weekdayShort: (d: Date | string) => format(toAcademyTime(d), 'EEE', { locale: es }),
  weekdayLong: (d: Date | string) => format(toAcademyTime(d), 'EEEE', { locale: es }),
  dayNumber: (d: Date | string) => format(toAcademyTime(d), 'd'),
  dayMonth: (d: Date | string) => format(toAcademyTime(d), "d 'de' MMMM", { locale: es }),
  fullDate: (d: Date | string) => format(toAcademyTime(d), "EEEE d 'de' MMMM", { locale: es }),
  shortDate: (d: Date | string) => format(toAcademyTime(d), 'd MMM yyyy', { locale: es }),
  monthYear: (d: Date | string) => format(toAcademyTime(d), 'MMMM yyyy', { locale: es }),
}
