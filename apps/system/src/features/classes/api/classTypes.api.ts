import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { TablesUpdate } from '@/types/database'
import { pickUniqueSlug, slugify } from '../slug'
import type { ClassTypeFormData } from '../schemas'
import type { ClassType } from '../types'

export async function listClassTypes(): Promise<ClassType[]> {
  return unwrap(await supabase.from('class_types').select('*').is('deleted_at', null).order('name'))
}

async function generateSlug(name: string): Promise<string> {
  const base = slugify(name)
  const rows = unwrap(await supabase.from('class_types').select('slug').ilike('slug', `${base}%`))
  return pickUniqueSlug(
    base,
    rows.map((row) => row.slug),
  )
}

export async function createClassType(data: ClassTypeFormData): Promise<ClassType> {
  const slug = await generateSlug(data.name)
  return unwrap(await supabase.from('class_types').insert({ ...data, slug }).select().single())
}

export async function updateClassType(id: string, data: ClassTypeFormData): Promise<ClassType> {
  return unwrap(await supabase.from('class_types').update(data).eq('id', id).select().single())
}

export async function setClassTypeActive(id: string, active: boolean): Promise<ClassType> {
  return unwrap(await supabase.from('class_types').update({ active }).eq('id', id).select().single())
}

/** Borrado lógico: los estilos con historial de clases nunca se eliminan. */
export async function archiveClassType(id: string): Promise<ClassType> {
  const patch: TablesUpdate<'class_types'> = { active: false, deleted_at: new Date().toISOString() }
  return unwrap(await supabase.from('class_types').update(patch).eq('id', id).select().single())
}
