import type { Enums, Tables } from '@/types/database'

export type ClassType = Tables<'class_types'>
export type ClassLevel = Enums<'class_level'>
export type Room = Tables<'rooms'>
export type ClassCategory = Tables<'class_categories'>

/** Plantilla recurrente con lo necesario para pintarla en el resumen semanal. */
export type ScheduleWithDetails = Tables<'class_schedules'> & {
  class_type: Pick<ClassType, 'id' | 'name' | 'color'> | null
  teacher: Pick<Tables<'teachers'>, 'id' | 'full_name'> | null
  room: Pick<Room, 'id' | 'name'> | null
}
