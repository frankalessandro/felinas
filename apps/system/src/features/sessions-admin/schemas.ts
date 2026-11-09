import { z } from 'zod'
import type { SessionKind } from '@/features/schedule/types'
import { toUtcIso } from './dateInputs'
import type { SessionInsert } from './types'

const MAX_CAPACITY = 200

/** Estado del formulario: todo son strings porque vienen de inputs. */
export interface SessionFormState {
  kind: SessionKind
  classTypeId: string
  teacherId: string
  /** Vacío = sin salón. */
  roomId: string
  date: string
  startTime: string
  endTime: string
  capacity: string
  title: string
}

export type SessionFormErrors = Partial<Record<keyof SessionFormState, string>>

const timeField = z.string().regex(/^\d{2}:\d{2}$/, 'Hora inválida')

const sessionFormSchema = z
  .object({
    kind: z.enum(['group', 'private']),
    classTypeId: z.string().min(1, 'Elige el tipo de clase'),
    teacherId: z.string().min(1, 'Elige el profesor'),
    roomId: z.string(),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Elige la fecha'),
    startTime: timeField,
    endTime: timeField,
    capacity: z.number({ error: 'Cupo inválido' }).int('Debe ser un número entero').min(1, 'Mínimo 1 cupo').max(MAX_CAPACITY, `Máximo ${MAX_CAPACITY} cupos`),
    title: z.string().trim().max(80, 'Máximo 80 caracteres'),
  })
  .refine((v) => v.endTime > v.startTime, { path: ['endTime'], message: 'Debe terminar después de iniciar' })

export type SessionFormValues = z.infer<typeof sessionFormSchema>

type ValidationResult = { ok: true; values: SessionFormValues } | { ok: false; errors: SessionFormErrors }

/** `minCapacity` evita bajar el cupo por debajo de las alumnas ya reservadas al editar. */
export function validateSessionForm(state: SessionFormState, minCapacity = 1): ValidationResult {
  const parsed = sessionFormSchema.safeParse({ ...state, capacity: state.capacity.trim() === '' ? Number.NaN : Number(state.capacity) })
  if (!parsed.success) {
    const errors: SessionFormErrors = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as keyof SessionFormState
      errors[field] ??= issue.message
    }
    return { ok: false, errors }
  }
  if (parsed.data.capacity < minCapacity) {
    return { ok: false, errors: { capacity: `Ya hay ${minCapacity} reservadas: el cupo no puede ser menor` } }
  }
  return { ok: true, values: parsed.data }
}

/** Campos editables de una sesión (el tipo grupal/personalizada no cambia después de crearla). */
export function toSessionUpdate(values: SessionFormValues): Omit<SessionInsert, 'kind'> {
  return {
    class_type_id: values.classTypeId,
    teacher_id: values.teacherId,
    room_id: values.roomId || null,
    starts_at: toUtcIso(values.date, values.startTime),
    ends_at: toUtcIso(values.date, values.endTime),
    capacity: values.capacity,
    title: values.title || null,
  }
}

export function toSessionInsert(values: SessionFormValues): SessionInsert {
  return { kind: values.kind, ...toSessionUpdate(values) }
}
