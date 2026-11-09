import type { Database } from '@/types/database'

type Functions = Database['public']['Functions']

/**
 * El generador de tipos de Supabase marca como no-nulos los parámetros de las RPC aunque en SQL
 * acepten `null` (ej. `p_class_count` en planes mensuales). Este helper permite `null` en esos
 * parámetros sin regar casts por el código; la validación real la hace la función en la base.
 */
export function rpcArgs<Name extends keyof Functions>(
  _name: Name,
  args: { [K in keyof Functions[Name]['Args']]: Functions[Name]['Args'][K] | null },
): Functions[Name]['Args'] {
  return args as Functions[Name]['Args']
}
