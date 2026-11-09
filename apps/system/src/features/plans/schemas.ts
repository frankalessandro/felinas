import { z } from 'zod'
import { optionalPrice, optionalText, requiredText } from '@/lib/formFields'

const POSITIVE_INT = /^\d+$/
const DEFAULT_DURATION_DAYS = 30

function isPositiveInt(raw: string): boolean {
  return POSITIVE_INT.test(raw) && Number(raw) > 0
}

/**
 * Los campos de cupo son condicionales al tipo, por eso llegan como texto crudo
 * y se validan/normalizan al final: la base exige exactamente uno de los dos.
 * `quotas` guarda el máximo por categoría como texto (vacío = sin límite).
 */
export const planFormSchema = z
  .object({
    name: requiredText('Escribe el nombre del plan', 80),
    description: optionalText(300),
    type: z.enum(['package', 'monthly']),
    validity: z.enum(['calendar_month', 'days']),
    class_count: z.string().trim(),
    weekly_limit: z.string().trim(),
    duration_days: z.string().trim(),
    price: optionalPrice('Precio inválido'),
    is_private: z.boolean(),
    active: z.boolean(),
    class_type_ids: z.array(z.string()).min(1, 'Elige al menos un estilo'),
    quotas: z.record(z.string(), z.string().trim()),
  })
  .superRefine((value, ctx) => {
    const field = value.type === 'package' ? 'class_count' : 'weekly_limit'
    if (!isPositiveInt(value[field])) {
      ctx.addIssue({ code: 'custom', path: [field], message: 'Ingresa un número mayor a 0' })
    }
    if (value.validity === 'days' && !isPositiveInt(value.duration_days)) {
      ctx.addIssue({ code: 'custom', path: ['duration_days'], message: 'Ingresa una duración en días' })
    }

    const limits = Object.values(value.quotas).filter((raw) => raw !== '')
    if (limits.some((raw) => !isPositiveInt(raw))) {
      ctx.addIssue({ code: 'custom', path: ['quotas'], message: 'Los cupos por categoría deben ser números mayores a 0' })
      return
    }
    // Un tope por categoría mayor al total del plan nunca se alcanzaría: casi seguro es un error de tipeo.
    if (value.type === 'package' && isPositiveInt(value.class_count)) {
      const total = Number(value.class_count)
      if (limits.some((raw) => Number(raw) > total)) {
        ctx.addIssue({ code: 'custom', path: ['quotas'], message: `Ninguna categoría puede pasar de las ${total} clases del plan` })
      }
    }
  })
  .transform(({ class_count, weekly_limit, duration_days, quotas, type, validity, ...rest }) => ({
    ...rest,
    type,
    validity,
    class_count: type === 'package' ? Number(class_count) : null,
    weekly_limit: type === 'monthly' ? Number(weekly_limit) : null,
    // En planes por mes calendario el vencimiento lo fija la base; la columna sigue siendo obligatoria.
    duration_days: validity === 'days' ? Number(duration_days) : DEFAULT_DURATION_DAYS,
    category_quotas: Object.entries(quotas)
      .filter(([, raw]) => raw !== '')
      .map(([category_id, raw]) => ({ category_id, max_classes: Number(raw) })),
  }))
export type PlanFormValues = z.input<typeof planFormSchema>
export type PlanFormData = z.output<typeof planFormSchema>
