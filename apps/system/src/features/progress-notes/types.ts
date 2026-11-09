import type { Tables } from '@/types/database'

/** Nota de seguimiento con la clase a la que se refiere (si la tiene). */
export type ProgressNote = Tables<'progress_notes'> & {
  session: {
    starts_at: string
    title: string | null
    class_type: { name: string; color: string } | null
    teacher: { full_name: string } | null
  } | null
}
