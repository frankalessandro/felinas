import { z } from 'zod'
import { optionalDate, optionalPhone, optionalText } from '@/lib/formFields'
import { parseMoneyInput } from '@/lib/money'
import { isMinor } from './lib'

export const studentProfileSchema = z
  .object({
    phone: optionalPhone(),
    birth_date: optionalDate(),
    guardian_name: optionalText(80),
    guardian_phone: optionalPhone(),
  })
  .superRefine((value, ctx) => {
    if (!isMinor(value.birth_date)) return
    if (!value.guardian_name) ctx.addIssue({ code: 'custom', path: ['guardian_name'], message: 'Las menores de edad necesitan acudiente' })
    if (!value.guardian_phone) ctx.addIssue({ code: 'custom', path: ['guardian_phone'], message: 'Agrega el teléfono del acudiente' })
  })
export type StudentProfileFormValues = z.input<typeof studentProfileSchema>
export type StudentProfileFormData = z.output<typeof studentProfileSchema>

export const assignPlanSchema = z.object({
  plan_id: z.string().min(1, 'Elige un plan'),
  month: z.enum(['current', 'next']),
  /** Vacío = precio de catálogo del plan. */
  price: z.string().transform(parseMoneyInput),
  notes: optionalText(300),
})
export type AssignPlanFormValues = z.input<typeof assignPlanSchema>
export type AssignPlanFormData = z.output<typeof assignPlanSchema>
