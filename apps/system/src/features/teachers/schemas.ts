import { z } from 'zod'
import { hexColor, optionalPhone, optionalText, optionalUrl, requiredText } from '@/lib/formFields'

/** Acepta `@usuario`, `usuario` o el enlace completo y guarda solo el usuario. */
const instagramHandle = z
  .string()
  .trim()
  .transform((value) => value.replace(/^https?:\/\/(www\.)?instagram\.com\//i, '').replace(/^@/, '').replace(/\/.*$/, ''))
  .refine((value) => value === '' || /^[a-z0-9._]{1,30}$/i.test(value), 'Usuario de Instagram inválido')
  .transform((value) => (value === '' ? null : value))

export const teacherFormSchema = z.object({
  full_name: requiredText('Escribe el nombre', 80),
  bio: optionalText(600),
  photo_url: optionalUrl(),
  phone: optionalPhone(),
  instagram: instagramHandle,
  color: hexColor(),
})
export type TeacherFormValues = z.input<typeof teacherFormSchema>
export type TeacherFormData = z.output<typeof teacherFormSchema>
