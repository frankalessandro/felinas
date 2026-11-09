import { z } from 'zod'
import { dateField } from '@/lib/formFields'
import { isAgeInRange, MAX_AGE, MIN_AGE, NAME_MAX, NAME_MIN, normalizePhone } from './personalData'

/** Campos personales compartidos por el onboarding y "Mi perfil". Reflejan la validación de la base. */
export const personalFieldsShape = {
  full_name: z
    .string()
    .trim()
    .min(NAME_MIN, `Escribe tu nombre (mínimo ${NAME_MIN} letras)`)
    .max(NAME_MAX, `Máximo ${NAME_MAX} caracteres`),
  phone: z
    .string()
    .trim()
    .min(1, 'Escribe tu celular')
    .transform((value, ctx) => {
      const normalized = normalizePhone(value)
      if (normalized) return normalized
      ctx.addIssue({ code: 'custom', message: 'Celular inválido: 10 dígitos que empiecen por 3' })
      return z.NEVER
    }),
  birth_date: dateField('Elige tu fecha de nacimiento').refine(isAgeInRange, `La edad debe estar entre ${MIN_AGE} y ${MAX_AGE} años`),
  image_consent: z.boolean(),
}

export const profileSchema = z.object(personalFieldsShape)
export type ProfileFormValues = z.input<typeof profileSchema>
export type ProfileFormData = z.output<typeof profileSchema>
