import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import { env } from './env'
import { createLocalClient } from './localDb'

function createSupabase(): SupabaseClient<Database> {
  if (env.useLocalDb) {
    return createLocalClient({ postgrestUrl: env.postgrestUrl, email: env.localUser, jwtSecret: env.localJwtSecret })
  }
  return createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
    auth: { flowType: 'pkce', persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })
}

export const supabase = createSupabase()
