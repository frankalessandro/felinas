import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ACADEMY_TZ, formatters, isSameAcademyDay, toAcademyTime, toDateKey } from '@/lib/dates'
import type { CalendarEvent, CalendarHighlight, HourRange, PositionedEvent } from './types'

export const DEFAULT_HOUR_RANGE: HourRange = { startHour: 6, endHour: 22 }
const MIN_VISIBLE_HOURS = 8
const MINUTES_PER_HOUR = 60
const MINUTES_PER_DAY = 24 * MINUTES_PER_HOUR

function minutesOfDay(iso: string): number {
  const d = toAcademyTime(iso)
  return d.getHours() * MINUTES_PER_HOUR + d.getMinutes()
}

/** Minuto de fin dentro del día de inicio; si cruza medianoche se recorta al final del día. */
function endMinutesInStartDay(event: CalendarEvent): number {
  return isSameAcademyDay(event.startsAt, event.endsAt) ? minutesOfDay(event.endsAt) : MINUTES_PER_DAY
}

function byStart(a: CalendarEvent, b: CalendarEvent): number {
  return a.startsAt.localeCompare(b.startsAt) || a.endsAt.localeCompare(b.endsAt)
}

/** Agrupa por `yyyy-MM-dd` (hora de la academia). Todos los días pedidos existen en el mapa. */
export function groupEventsByDay(events: CalendarEvent[], days: Date[]): Map<string, CalendarEvent[]> {
  const groups = new Map<string, CalendarEvent[]>(days.map((day) => [toDateKey(day), []]))
  for (const event of [...events].sort(byStart)) {
    groups.get(toDateKey(event.startsAt))?.push(event)
  }
  return groups
}

/** Rango de horas visible: se ajusta a los eventos con 1 h de margen; sin eventos usa el rango por defecto. */
export function getVisibleRange(events: CalendarEvent[], fallback: HourRange = DEFAULT_HOUR_RANGE): HourRange {
  if (events.length === 0) return fallback
  const first = Math.min(...events.map((e) => minutesOfDay(e.startsAt)))
  const last = Math.max(...events.map(endMinutesInStartDay))
  const startHour = Math.max(0, Math.floor(first / MINUTES_PER_HOUR) - 1)
  const endHour = Math.min(24, Math.max(Math.ceil(last / MINUTES_PER_HOUR) + 1, startHour + MIN_VISIBLE_HOURS))
  return { startHour: Math.max(0, Math.min(startHour, endHour - MIN_VISIBLE_HOURS)), endHour }
}

interface TimedEvent {
  event: CalendarEvent
  start: number
  end: number
  column: number
}

/** Coloca los eventos solapados lado a lado y calcula su posición vertical dentro del rango. */
export function layoutDayEvents(events: CalendarEvent[], range: HourRange): PositionedEvent[] {
  const rangeStart = range.startHour * MINUTES_PER_HOUR
  const rangeSpan = (range.endHour - range.startHour) * MINUTES_PER_HOUR
  const timed = [...events].sort(byStart).map((event) => ({
    event,
    start: minutesOfDay(event.startsAt),
    end: Math.max(endMinutesInStartDay(event), minutesOfDay(event.startsAt) + 1),
    column: 0,
  }))

  const result: PositionedEvent[] = []
  let cluster: TimedEvent[] = []
  let clusterEnd = -1
  let columnEnds: number[] = []

  const flush = () => {
    for (const item of cluster) {
      result.push({
        event: item.event,
        topPct: ((item.start - rangeStart) / rangeSpan) * 100,
        heightPct: ((item.end - item.start) / rangeSpan) * 100,
        column: item.column,
        columns: columnEnds.length,
      })
    }
    cluster = []
    columnEnds = []
    clusterEnd = -1
  }

  for (const item of timed) {
    if (item.start >= clusterEnd) flush()
    const free = columnEnds.findIndex((end) => end <= item.start)
    item.column = free === -1 ? columnEnds.length : free
    columnEnds[item.column] = item.end
    cluster.push(item)
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  flush()
  return result
}

/** Fecha (hora academia) del día dado a los `minutes` indicados desde medianoche. */
export function dateAtMinutes(day: Date, minutes: number): Date {
  const d = toAcademyTime(day)
  return new TZDate(d.getFullYear(), d.getMonth(), d.getDate(), Math.floor(minutes / MINUTES_PER_HOUR), minutes % MINUTES_PER_HOUR, ACADEMY_TZ)
}

/** Minutos desde medianoche (hora academia) de un instante, útil para la línea de "ahora". */
export function getMinutesOfDay(date: Date | string): number {
  return minutesOfDay(typeof date === 'string' ? date : date.toISOString())
}

export function formatHourLabel(hour: number): string {
  return format(new Date(2000, 0, 1, hour), 'h a', { locale: es })
}

/** "22 – 28 sep 2026", "29 sep – 5 oct 2026" o con dos años si cruza fin de año. */
export function formatWeekRange(days: Date[]): string {
  const first = toAcademyTime(days[0] ?? new Date())
  const last = toAcademyTime(days[days.length - 1] ?? first)
  const opts = { locale: es }
  if (first.getFullYear() !== last.getFullYear()) {
    return `${format(first, 'd MMM yyyy', opts)} – ${format(last, 'd MMM yyyy', opts)}`
  }
  if (first.getMonth() !== last.getMonth()) {
    return `${format(first, 'd MMM', opts)} – ${format(last, 'd MMM yyyy', opts)}`
  }
  return `${format(first, 'd', opts)} – ${format(last, 'd MMM yyyy', opts)}`
}

/** Etiqueta accesible con todos los datos relevantes de un evento. */
export function describeEvent(event: CalendarEvent): string {
  const parts = [
    event.title,
    formatters.fullDate(event.startsAt),
    formatters.timeRange(event.startsAt, event.endsAt),
    event.teacherName && `con ${event.teacherName}`,
    event.roomName && `salón ${event.roomName}`,
    `${event.booked} de ${event.capacity} cupos`,
    event.waitlist ? `${event.waitlist} en lista de espera` : null,
    event.status === 'cancelled' ? 'clase cancelada' : null,
    event.badge?.label,
  ]
  return parts.filter(Boolean).join(', ')
}

/** Fondo tintado con el color del tipo de clase sobre la superficie oscura. */
export function tintedBackground(color: string, percent = 22): string {
  return `color-mix(in srgb, ${color} ${percent}%, var(--color-surface))`
}

/** Agrupa eventos de la academia por `yyyy-MM-dd`. Todos los días pedidos existen en el mapa. */
export function groupHighlightsByDay(highlights: CalendarHighlight[], days: Date[]): Map<string, CalendarHighlight[]> {
  const groups = new Map<string, CalendarHighlight[]>(days.map((day) => [toDateKey(day), []]))
  for (const highlight of highlights) {
    groups.get(highlight.date)?.push(highlight)
  }
  return groups
}

/** Etiqueta accesible de un evento de la academia. */
export function describeHighlight(highlight: CalendarHighlight): string {
  const parts = [
    `Evento: ${highlight.title}`,
    highlight.subtitle && `en ${highlight.subtitle}`,
    highlight.time ?? 'horario por confirmar',
    highlight.badge,
  ]
  return parts.filter(Boolean).join(', ')
}
