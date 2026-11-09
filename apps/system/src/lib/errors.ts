import type { PostgrestError } from '@supabase/supabase-js'

/**
 * Las RPC de la base lanzan `raise exception using message, hint = '<CÓDIGO>'`.
 * El mensaje ya viene en español y listo para mostrar; el hint permite reaccionar
 * a casos concretos (ej. ofrecer lista de espera) sin comparar textos.
 */
export class AppError extends Error {
  readonly code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.name = 'AppError'
    this.code = code
  }
}

const FALLBACK_MESSAGE = 'Algo salió mal. Intenta de nuevo.'

function isPostgrestError(error: unknown): error is PostgrestError {
  return typeof error === 'object' && error !== null && 'message' in error && 'code' in error
}

export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) return error
  if (isPostgrestError(error)) {
    if (error.code === '23505') return new AppError('Ya existe un registro con ese nombre.', 'DUPLICATE')
    // P0001 = raise exception de nuestras funciones: el mensaje es para humanos.
    const isOurs = error.code === 'P0001' || Boolean(error.hint)
    return new AppError(isOurs ? error.message : FALLBACK_MESSAGE, error.hint || null)
  }
  if (error instanceof Error) return new AppError(error.message || FALLBACK_MESSAGE)
  return new AppError(FALLBACK_MESSAGE)
}

interface SupabaseResult<T> {
  data: T | null
  error: PostgrestError | null
}

/** Desenvuelve `{ data, error }` de Supabase: lanza AppError o devuelve data (nunca null). */
export function unwrap<T>(result: SupabaseResult<T>): T {
  if (result.error) throw toAppError(result.error)
  if (result.data === null) throw new AppError('No se encontró el registro.', 'NOT_FOUND')
  return result.data
}

/** Igual que `unwrap`, pero para consultas donde "no existe" es un resultado válido (`maybeSingle`). */
export function unwrapMaybe<T>(result: SupabaseResult<T>): T | null {
  if (result.error) throw toAppError(result.error)
  return result.data
}

export function getErrorMessage(error: unknown): string {
  return toAppError(error).message
}
