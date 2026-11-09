import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { SessionFilters, SessionWithDetails } from '../types'

export const SESSION_DETAILS_SELECT = `
  *,
  class_type:class_types ( id, name, color, level ),
  teacher:teachers ( id, full_name, photo_url ),
  room:rooms ( id, name )
` as const

/** Sesiones en un rango. RLS ya filtra lo que cada rol puede ver (ej. personalizadas ajenas). */
export async function listSessions(filters: SessionFilters): Promise<SessionWithDetails[]> {
  let query = supabase
    .from('class_sessions')
    .select(SESSION_DETAILS_SELECT)
    .gte('starts_at', filters.from)
    .lt('starts_at', filters.to)
    .order('starts_at')

  if (filters.teacherId) query = query.eq('teacher_id', filters.teacherId)
  if (filters.classTypeId) query = query.eq('class_type_id', filters.classTypeId)
  if (filters.kind) query = query.eq('kind', filters.kind)

  return unwrap(await query)
}

export async function getSession(sessionId: string): Promise<SessionWithDetails> {
  return unwrap(await supabase.from('class_sessions').select(SESSION_DETAILS_SELECT).eq('id', sessionId).single())
}
