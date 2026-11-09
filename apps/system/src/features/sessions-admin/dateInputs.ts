import { TZDate } from '@date-fns/tz'
import { format } from 'date-fns'
import { ACADEMY_TZ, toAcademyTime } from '@/lib/dates'

const MINUTES_PER_HOUR = 60
const LAST_MINUTE_OF_DAY = 23 * MINUTES_PER_HOUR + 59

/** Combina `yyyy-MM-dd` + `HH:mm` (hora de la academia) en un ISO UTC para guardar. */
export function toUtcIso(dateKey: string, time: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const [hours, minutes] = time.split(':').map(Number)
  return new TZDate(year ?? 1970, (month ?? 1) - 1, day ?? 1, hours ?? 0, minutes ?? 0, 0, ACADEMY_TZ).toISOString()
}

/** Valor para `<input type="time">` de un instante, en hora de la academia. */
export function toTimeInput(iso: string): string {
  return format(toAcademyTime(iso), 'HH:mm')
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number)
  return (hours ?? 0) * MINUTES_PER_HOUR + (minutes ?? 0)
}

/** Suma minutos a un `HH:mm` sin salirse del día. */
export function addMinutesToTime(time: string, delta: number): string {
  const total = Math.min(LAST_MINUTE_OF_DAY, Math.max(0, timeToMinutes(time) + delta))
  const hours = Math.floor(total / MINUTES_PER_HOUR)
  const minutes = total % MINUTES_PER_HOUR
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}
