import type { Profile, UserRole } from '@/features/auth/types'
import { useDevViewStore } from './store'

/**
 * El modo beta solo cambia qué pantallas se ven. Los permisos reales los decide la base:
 * `is_developer` solo lo puede activar postgres y las RPC lo validan del lado del servidor.
 */
export function isDeveloper(profile: Profile | null): boolean {
  // Las herramientas de desarrollo (selector de vistas, /beta, suplantar profe) no existen en un build de producción.
  return import.meta.env.DEV && profile?.is_developer === true
}

export function resolveEffectiveRole(profile: Profile, viewAs: UserRole | null): UserRole {
  return isDeveloper(profile) && viewAs ? viewAs : profile.role
}

/** Para guards (fuera de React): lee el store sin suscribirse. */
export function getEffectiveRole(profile: Profile): UserRole {
  return resolveEffectiveRole(profile, useDevViewStore.getState().viewAs)
}

export function useEffectiveRole(profile: Profile): UserRole {
  const viewAs = useDevViewStore((state) => state.viewAs)
  return resolveEffectiveRole(profile, viewAs)
}

/** Profe suplantado por el desarrollador, o `null` si no aplica. */
export function useImpersonatedTeacherId(profile: Profile): string | null {
  const { viewAs, teacherId } = useDevViewStore()
  return isDeveloper(profile) && viewAs === 'teacher' ? teacherId : null
}
