import { useQuery } from '@tanstack/react-query'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { useImpersonatedTeacherId } from '@/features/dev/effectiveRole'
import { currentTeacherQuery, teacherByIdQuery } from '../queries'

/**
 * Ficha de profe vinculada a la cuenta actual (`null` si administración aún no la vinculó).
 * En modo beta, el desarrollador ve la ficha del profe que eligió.
 */
export function useCurrentTeacher() {
  const profile = useCurrentProfile()
  const impersonatedId = useImpersonatedTeacherId(profile)
  const own = useQuery({ ...currentTeacherQuery(profile.id), enabled: impersonatedId === null })
  const impersonated = useQuery({ ...teacherByIdQuery(impersonatedId ?? ''), enabled: impersonatedId !== null })
  return impersonatedId === null ? own : impersonated
}
