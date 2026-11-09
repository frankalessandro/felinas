import { z } from 'zod'
import { dateField, optionalText } from '@/lib/formFields'
import { parseMoneyInput } from '@/lib/money'
import { RECEIPT_EXTENSIONS, RECEIPT_MAX_BYTES } from './constants'

export const registerPaymentSchema = z.object({
  amount: z
    .string()
    .transform(parseMoneyInput)
    .refine((value): value is number => value !== null && value > 0, 'Ingresa un valor mayor a 0'),
  method: z.enum(['cash', 'nequi', 'daviplata', 'transfer', 'card', 'other']),
  paid_on: dateField('Elige la fecha del pago'),
  reference: optionalText(80),
  notes: optionalText(300),
})
export type RegisterPaymentValues = z.input<typeof registerPaymentSchema>
export type RegisterPaymentData = z.output<typeof registerPaymentSchema>

export const setPriceSchema = z.object({
  price: z
    .string()
    .transform(parseMoneyInput)
    .refine((value): value is number => value !== null, 'Ingresa el valor (0 si es gratis)'),
  discount_note: optionalText(120),
})
export type SetPriceValues = z.input<typeof setPriceSchema>
export type SetPriceData = z.output<typeof setPriceSchema>

export const voidPaymentSchema = z.object({
  reason: z.string().trim().min(3, 'Cuéntanos el motivo').max(200, 'Máximo 200 caracteres'),
})
export type VoidPaymentValues = z.input<typeof voidPaymentSchema>
export type VoidPaymentData = z.output<typeof voidPaymentSchema>

/** Devuelve el mensaje de error del comprobante o null si es válido. */
export function validateReceiptFile(file: File): string | null {
  if (!(file.type in RECEIPT_EXTENSIONS)) return 'El comprobante debe ser imagen (JPG, PNG, WEBP) o PDF.'
  if (file.size > RECEIPT_MAX_BYTES) return 'El comprobante pesa más de 5 MB.'
  return null
}
