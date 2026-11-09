import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { Enums } from '@/types/database'
import type { StudentProfileFormData } from '../schemas'
import type { PlanSummary, StudentListItem, StudentProfile } from '../types'

/** Elige el plan vigente que vence primero: es el que más importa vigilar. */
function pickSoonestExpiring(plans: PlanSummary[]): PlanSummary | null {
  const sorted = [...plans].sort((a, b) => (a.expires_on ?? '').localeCompare(b.expires_on ?? ''))
  return sorted[0] ?? null
}

function groupByStudent(plans: PlanSummary[]): Map<string, PlanSummary[]> {
  const groups = new Map<string, PlanSummary[]>()
  for (const plan of plans) {
    if (!plan.student_id) continue
    groups.set(plan.student_id, [...(groups.get(plan.student_id) ?? []), plan])
  }
  return groups
}

/** Alumnas aprobadas (activas o inactivas). Las pendientes viven en Solicitudes. */
export async function listStudents(): Promise<StudentListItem[]> {
  const [profiles, summaries] = await Promise.all([
    supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .neq('status', 'pending')
      .is('deleted_at', null)
      .order('full_name'),
    supabase.from('student_plan_summary').select('*').eq('effective_status', 'active'),
  ])

  const plansByStudent = groupByStudent(unwrap(summaries))
  return unwrap(profiles).map((profile) => ({
    profile,
    activePlan: pickSoonestExpiring(plansByStudent.get(profile.id) ?? []),
  }))
}

export async function getStudent(studentId: string): Promise<StudentProfile> {
  return unwrap(await supabase.from('profiles').select('*').eq('id', studentId).eq('role', 'student').single())
}

export async function updateStudentProfile(studentId: string, data: StudentProfileFormData): Promise<StudentProfile> {
  return unwrap(await supabase.from('profiles').update(data).eq('id', studentId).select().single())
}

export async function setStudentStatus(studentId: string, status: Enums<'profile_status'>): Promise<StudentProfile> {
  return unwrap(await supabase.from('profiles').update({ status }).eq('id', studentId).select().single())
}
