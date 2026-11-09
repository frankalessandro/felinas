import { supabase } from '@/lib/supabase'
import { toAppError, unwrap } from '@/lib/errors'
import type { TeacherFormData } from '../schemas'
import type { Teacher, TeacherWithSchedules } from '../types'

const TEACHER_SELECT = `
  *,
  schedules:class_schedules (
    id, weekday, start_time, end_time, capacity, active,
    class_type:class_types ( id, name, color ),
    room:rooms ( id, name )
  )
` as const

export async function listTeachers(): Promise<TeacherWithSchedules[]> {
  return unwrap(await supabase.from('teachers').select(TEACHER_SELECT).is('deleted_at', null).order('full_name'))
}

export async function createTeacher(data: TeacherFormData): Promise<Teacher> {
  return unwrap(await supabase.from('teachers').insert(data).select().single())
}

export async function updateTeacher(id: string, data: TeacherFormData): Promise<Teacher> {
  return unwrap(await supabase.from('teachers').update(data).eq('id', id).select().single())
}

/** Desactivar conserva el historial de clases; la profe deja de ofrecerse al crear horarios. */
export async function setTeacherActive(id: string, active: boolean): Promise<Teacher> {
  return unwrap(await supabase.from('teachers').update({ active }).eq('id', id).select().single())
}

export async function countUpcomingSessions(teacherId: string): Promise<number> {
  const { count, error } = await supabase
    .from('class_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('teacher_id', teacherId)
    .eq('status', 'scheduled')
    .gte('starts_at', new Date().toISOString())
  if (error) throw toAppError(error)
  return count ?? 0
}
