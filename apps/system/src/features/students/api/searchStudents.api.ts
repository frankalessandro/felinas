import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { Tables } from '@/types/database'

export type StudentSearchResult = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email' | 'phone' | 'avatar_url'>

const DEFAULT_LIMIT = 8

/** Quita caracteres que rompen la sintaxis de los filtros `or()` de PostgREST. */
function sanitizeTerm(term: string): string {
  return term.replace(/[,()%*\\]/g, ' ').trim()
}

/** Busca alumnas activas por nombre o correo (para selectores). Con término vacío devuelve las primeras por nombre. */
export async function searchStudents(term: string, limit = DEFAULT_LIMIT): Promise<StudentSearchResult[]> {
  const clean = sanitizeTerm(term)
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, phone, avatar_url')
    .eq('role', 'student')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order('full_name')
    .limit(limit)

  if (clean) query = query.or(`full_name.ilike.%${clean}%,email.ilike.%${clean}%`)

  return unwrap(await query)
}
