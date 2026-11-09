import { useQuery } from '@tanstack/react-query'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { studentPlansQuery } from '../queries'

/** Planes de la alumna que tiene la sesión abierta. */
export function useStudentPlans() {
  const profile = useCurrentProfile()
  return useQuery(studentPlansQuery(profile.id))
}
