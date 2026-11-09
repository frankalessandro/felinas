import type { Tables, TablesInsert } from '@/types/database'

export type StudentContact = Pick<Tables<'profiles'>, 'id' | 'full_name' | 'email' | 'phone' | 'avatar_url'>

/** Reserva activa (reservada o en lista de espera) con los datos de contacto de la alumna. */
export type SessionBooking = Tables<'bookings'> & {
  student: StudentContact | null
}

/** Plan vigente de una alumna, tal como lo entrega `student_plan_summary`. */
export interface StudentPlanOption {
  studentPlanId: string
  planName: string
  isPrivate: boolean
  classesRemaining: number | null
  expiresOn: string
}

export interface SessionFormOptions {
  teachers: Pick<Tables<'teachers'>, 'id' | 'full_name'>[]
  classTypes: Pick<Tables<'class_types'>, 'id' | 'name' | 'color'>[]
  rooms: Pick<Tables<'rooms'>, 'id' | 'name' | 'capacity'>[]
}

export type SessionInsert = TablesInsert<'class_sessions'>
