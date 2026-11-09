import type { QueryClient } from '@tanstack/react-query'
import { redirect } from '@tanstack/react-router'
import type { Session } from '@supabase/supabase-js'
import { getEffectiveRole } from '@/features/dev/effectiveRole'
import { profileQuery, sessionQuery } from './queries'
import { isApproved, ROLE_HOME } from './roles'
import type { Profile, UserRole } from './types'

export interface AuthContext {
  session: Session
  profile: Profile
}

/** Primer ingreso pendiente: falta completar el registro (nombre, celular, fecha de nacimiento, consentimientos). */
export function needsOnboarding(profile: Profile | null): boolean {
  return profile !== null && profile.onboarded_at === null
}

/** Exige sesión sin mirar el onboarding: solo para `/onboarding`, que es adonde se redirige. */
export async function requireSessionAnyState(queryClient: QueryClient): Promise<{ session: Session; profile: Profile | null }> {
  const session = await queryClient.ensureQueryData(sessionQuery)
  if (!session) throw redirect({ to: '/login' })
  const profile = await queryClient.ensureQueryData(profileQuery(session.user.id))
  return { session, profile }
}

/** Exige sesión y registro completo; si falta, manda a `/onboarding`. El perfil puede no estar aprobado. */
export async function requireSession(queryClient: QueryClient): Promise<{ session: Session; profile: Profile | null }> {
  const auth = await requireSessionAnyState(queryClient)
  if (needsOnboarding(auth.profile)) throw redirect({ to: '/onboarding' })
  return auth
}

/** Exige sesión y cuenta aprobada. Las cuentas pendientes van a /pending. */
export async function requireActiveUser(queryClient: QueryClient): Promise<AuthContext> {
  const { session, profile } = await requireSession(queryClient)
  if (!profile || !isApproved(profile)) throw redirect({ to: '/pending' })
  return { session, profile }
}

/**
 * La UI oculta lo que no te toca, pero el permiso real lo aplica RLS en la base.
 * Este guard solo evita que alguien vea una pantalla que igual vendría vacía.
 */
export function requireRole(profile: Profile, role: UserRole): void {
  const effectiveRole = getEffectiveRole(profile)
  if (effectiveRole !== role) throw redirect({ to: ROLE_HOME[effectiveRole] })
}
