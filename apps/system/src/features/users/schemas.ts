import { z } from 'zod'
import { dateField, requiredText } from '@/lib/formFields'
import { NO_PLAN } from './constants'

export const approveStudentSchema = z
  .object({
    plan_id: z.string(),
    starts_on: dateField('Elige la fecha de inicio'),
  })
  .transform(({ plan_id, starts_on }) => ({ planId: plan_id === NO_PLAN ? null : plan_id, startsOn: starts_on }))
export type ApproveStudentFormValues = z.input<typeof approveStudentSchema>
export type ApproveStudentFormData = z.output<typeof approveStudentSchema>

export const approveTeacherSchema = z
  .object({
    mode: z.enum(['existing', 'new']),
    teacher_id: z.string(),
    new_name: z.string().trim(),
  })
  .superRefine((value, ctx) => {
    if (value.mode === 'existing' && value.teacher_id === '') {
      ctx.addIssue({ code: 'custom', path: ['teacher_id'], message: 'Elige la ficha de profe' })
    }
    if (value.mode === 'new') {
      const result = requiredText('Escribe el nombre de la profe', 80).safeParse(value.new_name)
      if (!result.success) ctx.addIssue({ code: 'custom', path: ['new_name'], message: result.error.issues[0]?.message ?? 'Nombre inválido' })
    }
  })
  .transform((value) => (value.mode === 'existing' ? { teacherId: value.teacher_id, newTeacherName: null } : { teacherId: null, newTeacherName: value.new_name }))
export type ApproveTeacherFormValues = z.input<typeof approveTeacherSchema>
export type ApproveTeacherFormData = z.output<typeof approveTeacherSchema>
