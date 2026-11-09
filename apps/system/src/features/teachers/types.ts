import type { Tables } from '@/types/database'

export type Teacher = Tables<'teachers'>

export type TeacherSchedule = Pick<Tables<'class_schedules'>, 'id' | 'weekday' | 'start_time' | 'end_time' | 'capacity' | 'active'> & {
  class_type: Pick<Tables<'class_types'>, 'id' | 'name' | 'color'> | null
  room: Pick<Tables<'rooms'>, 'id' | 'name'> | null
}

export type TeacherWithSchedules = Teacher & { schedules: TeacherSchedule[] }

export interface TeacherStyle {
  id: string
  name: string
  color: string
}
