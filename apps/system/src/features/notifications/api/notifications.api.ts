import { supabase } from '@/lib/supabase'
import { toAppError, unwrap } from '@/lib/errors'
import type { AppNotification } from '../types'

const LIST_LIMIT = 30

export async function listNotifications(profileId: string): Promise<AppNotification[]> {
  return unwrap(
    await supabase.from('notifications').select('*').eq('profile_id', profileId).order('created_at', { ascending: false }).limit(LIST_LIMIT),
  )
}

export async function countUnreadNotifications(profileId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('profile_id', profileId)
    .is('read_at', null)
  if (error) throw toAppError(error)
  return count ?? 0
}

/** Solo `read_at` es editable por la usuaria (permiso a nivel de columna en la base). */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .is('read_at', null)
  if (error) throw toAppError(error)
}

export async function markAllNotificationsRead(profileId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('profile_id', profileId)
    .is('read_at', null)
  if (error) throw toAppError(error)
}
