import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import { createTeacher } from '@/features/teachers/api/teachers.api'
import { DEFAULT_TEACHER_COLOR } from '@/features/teachers/lib'
import { assignPlan } from '@/features/students/api/studentPlans.api'
import type { UserProfile, UserRole, UserStatus } from '../types'

export async function listUsers(): Promise<UserProfile[]> {
  return unwrap(await supabase.from('profiles').select('*').is('deleted_at', null).order('created_at', { ascending: false }))
}

export async function approveUser(profileId: string, role: UserRole, teacherId?: string): Promise<UserProfile> {
  return unwrap(await supabase.rpc('approve_user', { p_profile_id: profileId, p_role: role, p_teacher_id: teacherId }))
}

export async function setUserStatus(profileId: string, status: UserStatus): Promise<UserProfile> {
  return unwrap(await supabase.from('profiles').update({ status }).eq('id', profileId).select().single())
}

interface ApproveStudentInput {
  profileId: string
  planId: string | null
  startsOn: string
}

/** Aprueba y, si se eligió plan, lo asigna. Si el plan falla la alumna queda aprobada y se puede reintentar desde su ficha. */
export async function approveStudent({ profileId, planId, startsOn }: ApproveStudentInput): Promise<void> {
  await approveUser(profileId, 'student')
  if (planId) await assignPlan({ studentId: profileId, planId, startsOn })
}

interface ApproveTeacherInput {
  profileId: string
  teacherId: string | null
  newTeacherName: string | null
}

/** Vincula la cuenta a una ficha de profe existente o crea una nueva con el nombre dado. */
export async function approveTeacher({ profileId, teacherId, newTeacherName }: ApproveTeacherInput): Promise<void> {
  const linkedTeacherId = teacherId ?? (await createLinkedTeacherRecord(newTeacherName))
  await approveUser(profileId, 'teacher', linkedTeacherId)
}

async function createLinkedTeacherRecord(fullName: string | null): Promise<string> {
  const teacher = await createTeacher({
    full_name: fullName ?? 'Profe',
    bio: null,
    photo_url: null,
    phone: null,
    instagram: null,
    color: DEFAULT_TEACHER_COLOR,
  })
  return teacher.id
}
