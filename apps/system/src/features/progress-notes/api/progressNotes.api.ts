import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { ProgressNote } from '../types'

const NOTE_SELECT = `
  *,
  session:class_sessions (
    starts_at,
    title,
    class_type:class_types ( name, color ),
    teacher:teachers ( full_name )
  )
` as const

/** Notas de seguimiento de una alumna, la más reciente primero. RLS decide quién puede leerlas. */
export async function listProgressNotes(studentId: string): Promise<ProgressNote[]> {
  return unwrap(await supabase.from('progress_notes').select(NOTE_SELECT).eq('student_id', studentId).order('created_at', { ascending: false }))
}
