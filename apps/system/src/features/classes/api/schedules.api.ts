import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { TablesInsert } from '@/types/database'
import { NO_ROOM } from '../constants'
import type { ScheduleFormData } from '../schemas'
import type { ScheduleWithDetails } from '../types'

const SCHEDULE_SELECT = `
  *,
  class_type:class_types ( id, name, color ),
  teacher:teachers ( id, full_name ),
  room:rooms ( id, name )
` as const

export async function listSchedules(): Promise<ScheduleWithDetails[]> {
  return unwrap(await supabase.from('class_schedules').select(SCHEDULE_SELECT).order('start_time'))
}

function toRow(data: ScheduleFormData): TablesInsert<'class_schedules'> {
  return {
    ...data,
    weekday: Number(data.weekday),
    room_id: data.room_id === NO_ROOM ? null : data.room_id,
  }
}

export async function createSchedule(data: ScheduleFormData): Promise<void> {
  unwrap(await supabase.from('class_schedules').insert(toRow(data)).select('id').single())
}

export async function updateSchedule(id: string, data: ScheduleFormData): Promise<void> {
  unwrap(await supabase.from('class_schedules').update(toRow(data)).eq('id', id).select('id').single())
}

export async function setScheduleActive(id: string, active: boolean): Promise<void> {
  unwrap(await supabase.from('class_schedules').update({ active }).eq('id', id).select('id').single())
}
