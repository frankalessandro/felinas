import { toAppError } from '@/lib/errors'

export type PersonalField = 'full_name' | 'phone' | 'birth_date' | 'accept_data_policy'

export interface ServerFieldError {
  field: PersonalField
  message: string
}

const FIELD_BY_HINT: Record<string, PersonalField> = {
  INVALID_NAME: 'full_name',
  INVALID_PHONE: 'phone',
  INVALID_BIRTH_DATE: 'birth_date',
  DATA_POLICY_REQUIRED: 'accept_data_policy',
}

/** Traduce el hint de la base al campo del formulario; null si el error no es de validación de un campo. */
export function toServerFieldError(error: unknown): ServerFieldError | null {
  const { code, message } = toAppError(error)
  const field = code ? FIELD_BY_HINT[code] : undefined
  return field ? { field, message } : null
}
