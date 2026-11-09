import { z } from 'zod'

/** Piezas de esquema zod para formularios: los inputs son strings y la salida ya viene tipada. */

const HEX_COLOR = /^#[0-9a-f]{6}$/i
const TIME = /^\d{2}:\d{2}$/
const DATE = /^\d{4}-\d{2}-\d{2}$/
const PHONE = /^[+\d][\d\s()-]{5,19}$/

export const requiredText = (message: string, max = 120) =>
  z.string().trim().min(1, message).max(max, `Máximo ${max} caracteres`)

export const optionalText = (max = 500) =>
  z
    .string()
    .trim()
    .max(max, `Máximo ${max} caracteres`)
    .transform((value) => (value === '' ? null : value))

export const positiveInt = (message: string) =>
  z
    .string()
    .trim()
    .regex(/^\d+$/, message)
    .transform(Number)
    .refine((value) => value > 0, message)

export const optionalPrice = (message: string) =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || /^\d+(\.\d{1,2})?$/.test(value), message)
    .transform((value) => (value === '' ? null : Number(value)))

export const hexColor = (message = 'Color inválido (ej. #ff2e7e)') =>
  z
    .string()
    .trim()
    .regex(HEX_COLOR, message)
    .transform((value) => value.toLowerCase())

export const timeField = (message = 'Hora inválida') => z.string().regex(TIME, message)

export const dateField = (message = 'Fecha inválida') => z.string().regex(DATE, message)

export const optionalDate = (message = 'Fecha inválida') =>
  z
    .string()
    .refine((value) => value === '' || DATE.test(value), message)
    .transform((value) => (value === '' ? null : value))

export const optionalPhone = () =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || PHONE.test(value), 'Teléfono inválido')
    .transform((value) => (value === '' ? null : value))

function isValidUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const optionalUrl = () =>
  z
    .string()
    .trim()
    .refine((value) => value === '' || isValidUrl(value), 'Debe ser un enlace válido (https://…)')
    .transform((value) => (value === '' ? null : value))

/** Convierte `HH:mm:ss` de Postgres al `HH:mm` que entiende `<input type="time">`. */
export function toTimeInput(value: string): string {
  return value.slice(0, 5)
}
