import { differenceInYears } from 'date-fns'
import { academyToday, fromDateKey, toDateKey } from '@/lib/dates'

export const MIN_AGE = 5
export const MAX_AGE = 100
export const NAME_MIN = 2
export const NAME_MAX = 80

const COLOMBIA_PREFIX = '57'
const LOCAL_LENGTH = 10
const LOCAL_PATTERN = /^3\d{9}$/
const PHONE_CHARS = /^\+?[\d\s().-]+$/

/** Celular colombiano a 10 dígitos (sin +57 ni espacios), o null si no es válido. Mismo criterio que la base. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim()
  if (!PHONE_CHARS.test(trimmed)) return null
  let digits = trimmed.replace(/\D/g, '')
  if (digits.length === LOCAL_LENGTH + COLOMBIA_PREFIX.length && digits.startsWith(COLOMBIA_PREFIX)) digits = digits.slice(COLOMBIA_PREFIX.length)
  return LOCAL_PATTERN.test(digits) ? digits : null
}

/** `3001234567` pasa a `300 123 4567`. Si no calza el formato, devuelve el texto tal cual. */
export function formatPhone(phone: string | null): string {
  if (!phone) return ''
  const digits = phone.replace(/\D/g, '')
  if (!LOCAL_PATTERN.test(digits)) return phone
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`
}

function getAge(birthDateKey: string): number {
  return differenceInYears(academyToday(), fromDateKey(birthDateKey))
}

export function isAgeInRange(birthDateKey: string): boolean {
  const age = getAge(birthDateKey)
  return age >= MIN_AGE && age <= MAX_AGE
}

/** Límites de `<input type="date">` para que el selector nativo ya respete la edad permitida. */
export function getBirthDateBounds(): { min: string; max: string } {
  const today = academyToday()
  const min = new Date(today)
  min.setFullYear(today.getFullYear() - MAX_AGE)
  const max = new Date(today)
  max.setFullYear(today.getFullYear() - MIN_AGE)
  return { min: toDateKey(min), max: toDateKey(max) }
}
