import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { RoomFormData } from '../schemas'
import type { Room } from '../types'

export async function listRooms(): Promise<Room[]> {
  return unwrap(await supabase.from('rooms').select('*').order('name'))
}

export async function createRoom(data: RoomFormData): Promise<Room> {
  return unwrap(await supabase.from('rooms').insert(data).select().single())
}

export async function updateRoom(id: string, data: RoomFormData): Promise<Room> {
  return unwrap(await supabase.from('rooms').update(data).eq('id', id).select().single())
}

export async function setRoomActive(id: string, active: boolean): Promise<Room> {
  return unwrap(await supabase.from('rooms').update({ active }).eq('id', id).select().single())
}
