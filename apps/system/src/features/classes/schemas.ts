import { z } from 'zod'
import { dateField, hexColor, optionalDate, optionalText, positiveInt, requiredText, timeField } from '@/lib/formFields'

/** Valor del Select para «sin categoría» (Radix no admite value vacío en un item). */
export const NO_CATEGORY = 'none'

export const classTypeFormSchema = z.object({
  name: requiredText('Escribe el nombre del estilo', 60),
  description: optionalText(400),
  level: z.enum(['all', 'beginner', 'intermediate', 'advanced']),
  category_id: z.string().transform((value) => (value === '' || value === NO_CATEGORY ? null : value)),
  color: hexColor(),
  active: z.boolean(),
})
export type ClassTypeFormValues = z.input<typeof classTypeFormSchema>
export type ClassTypeFormData = z.output<typeof classTypeFormSchema>

export const roomFormSchema = z.object({
  name: requiredText('Escribe el nombre del salón', 60),
  capacity: positiveInt('Ingresa un cupo mayor a 0'),
  active: z.boolean(),
})
export type RoomFormValues = z.input<typeof roomFormSchema>
export type RoomFormData = z.output<typeof roomFormSchema>

export const scheduleFormSchema = z
  .object({
    class_type_id: z.string().min(1, 'Elige el estilo'),
    teacher_id: z.string().min(1, 'Elige la profe'),
    room_id: z.string(),
    weekday: z.string().min(1, 'Elige el día'),
    start_time: timeField(),
    end_time: timeField(),
    capacity: positiveInt('Ingresa un cupo mayor a 0'),
    min_bookings: positiveInt('Ingresa un mínimo mayor a 0'),
    description: optionalText(400),
    valid_from: dateField(),
    valid_until: optionalDate(),
    active: z.boolean(),
  })
  .refine((v) => v.end_time > v.start_time, { path: ['end_time'], message: 'Debe terminar después de iniciar' })
  .refine((v) => v.min_bookings <= v.capacity, { path: ['min_bookings'], message: 'No puede superar el cupo máximo' })
  .refine((v) => v.valid_until === null || v.valid_until >= v.valid_from, {
    path: ['valid_until'],
    message: 'Debe ser posterior al inicio de vigencia',
  })
export type ScheduleFormValues = z.input<typeof scheduleFormSchema>
export type ScheduleFormData = z.output<typeof scheduleFormSchema>
