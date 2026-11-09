import { differenceInCalendarDays } from 'date-fns'
import { formatters, toAcademyTime } from '@/lib/dates'

const MS_PER_MINUTE = 60_000
const MINUTES_PER_HOUR = 60
const COUNTDOWN_MAX_HOURS = 12

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** "Hoy a las 7:00 p. m.", "Mañana a las …" o "Jueves 2 · 7:00 p. m." (hora de la academia). */
export function describeSessionMoment(startsAt: string, now: Date): string {
  const days = differenceInCalendarDays(toAcademyTime(startsAt), toAcademyTime(now))
  const time = formatters.time(startsAt)
  if (days === 0) return `Hoy a las ${time}`
  if (days === 1) return `Mañana a las ${time}`
  return `${capitalize(formatters.weekdayLong(startsAt))} ${formatters.dayNumber(startsAt)} · ${time}`
}

/** Cuenta regresiva solo cuando falta poco; si no, `null` para no mostrar ruido. */
export function describeCountdown(startsAt: string, now: Date): string | null {
  const minutesLeft = Math.floor((new Date(startsAt).getTime() - now.getTime()) / MS_PER_MINUTE)
  if (minutesLeft <= 0) return null
  if (minutesLeft < MINUTES_PER_HOUR) return `Empieza en ${minutesLeft} min`
  const hours = Math.floor(minutesLeft / MINUTES_PER_HOUR)
  if (hours >= COUNTDOWN_MAX_HOURS) return null
  const minutes = minutesLeft % MINUTES_PER_HOUR
  return minutes === 0 ? `Empieza en ${hours} h` : `Empieza en ${hours} h ${minutes} min`
}
