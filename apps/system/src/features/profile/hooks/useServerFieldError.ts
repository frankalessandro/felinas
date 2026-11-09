import { useState } from 'react'
import { toServerFieldError, type PersonalField, type ServerFieldError } from '../serverFieldErrors'

/** Guarda el error de campo que devolvió la base (por si el cliente dejó pasar algo) hasta que la persona edite. */
export function useServerFieldError() {
  const [serverError, setServerError] = useState<ServerFieldError | null>(null)

  return {
    errorFor: (field: PersonalField): string | undefined => (serverError?.field === field ? serverError.message : undefined),
    /** true si el error era de un campo y quedó pintado; false si debe tratarse como error genérico. */
    capture: (error: unknown): boolean => {
      const fieldError = toServerFieldError(error)
      setServerError(fieldError)
      return fieldError !== null
    },
    clear: () => setServerError(null),
  }
}
