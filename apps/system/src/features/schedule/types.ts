import type { Enums, Tables } from '@/types/database'

export type SessionKind = Enums<'session_kind'>
export type SessionStatus = Enums<'session_status'>

/** Sesión con las relaciones que casi toda pantalla necesita para pintarla. */
export type SessionWithDetails = Tables<'class_sessions'> & {
  class_type: Pick<Tables<'class_types'>, 'id' | 'name' | 'color' | 'level'> | null
  teacher: Pick<Tables<'teachers'>, 'id' | 'full_name' | 'photo_url'> | null
  room: Pick<Tables<'rooms'>, 'id' | 'name'> | null
}

export interface SessionFilters {
  from: string
  to: string
  teacherId?: string
  classTypeId?: string
  kind?: SessionKind
}
