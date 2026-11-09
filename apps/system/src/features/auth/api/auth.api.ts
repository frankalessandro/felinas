import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toAppError, unwrapMaybe } from '@/lib/errors'
import type { Profile } from '../types'

export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession()
  if (error) throw toAppError(error)
  return data.session
}

export async function signInWithGoogle(): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  })
  if (error) throw toAppError(error)
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw toAppError(error)
}

export async function getProfile(userId: string): Promise<Profile | null> {
  return unwrapMaybe(await supabase.from('profiles').select('*').eq('id', userId).maybeSingle())
}
