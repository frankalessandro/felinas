import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { authKeys } from '../queries'

/** Sincroniza cambios de sesión de Supabase (login, logout, refresh) con la caché y los guards. */
export function useAuthListener(): void {
  const queryClient = useQueryClient()
  const router = useRouter()

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      queryClient.setQueryData(authKeys.session, session)
      if (event === 'SIGNED_OUT') queryClient.clear()
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        void router.invalidate()
      }
    })
    return () => data.subscription.unsubscribe()
  }, [queryClient, router])
}
