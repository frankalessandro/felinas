import { supabase } from '@/lib/supabase'
import { unwrap } from '@/lib/errors'
import type { MonthBirthday } from '../types'

export async function listMonthBirthdays(): Promise<MonthBirthday[]> {
  return unwrap(await supabase.rpc('admin_month_birthdays'))
}
