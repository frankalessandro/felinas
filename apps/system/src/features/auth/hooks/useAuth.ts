import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { sileo } from 'sileo'
import { getErrorMessage } from '@/lib/errors'
import { signInWithGoogle, signOut } from '../api/auth.api'
import { profileQuery, sessionQuery } from '../queries'
import type { Profile } from '../types'

/** Perfil del usuario actual. Solo usar debajo de rutas protegidas (el guard ya lo cargó). */
export function useCurrentProfile(): Profile {
  const { data: session } = useSuspenseQuery(sessionQuery)
  if (!session) throw new Error('useCurrentProfile se usó fuera de una ruta protegida')
  const { data: profile } = useSuspenseQuery(profileQuery(session.user.id))
  if (!profile) throw new Error('Perfil no encontrado')
  return profile
}

export function useGoogleSignIn() {
  return useMutation({
    mutationFn: signInWithGoogle,
    onError: (error) => sileo.error({ title: 'No pudimos iniciar sesión', description: getErrorMessage(error) }),
  })
}

export function useSignOut() {
  const router = useRouter()
  return useMutation({
    mutationFn: signOut,
    onSuccess: () => router.navigate({ to: '/login' }),
    onError: (error) => sileo.error({ title: 'No pudimos cerrar sesión', description: getErrorMessage(error) }),
  })
}
