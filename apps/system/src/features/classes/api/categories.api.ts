import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { ClassCategory } from '../types'

export async function listClassCategories(): Promise<ClassCategory[]> {
  return unwrap(await supabase.from('class_categories').select('*').order('sort_order').order('name'))
}
