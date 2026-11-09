import { useQuery } from '@tanstack/react-query'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { progressNotesQuery } from '../queries'

export function useMyProgressNotes() {
  const profile = useCurrentProfile()
  return useQuery(progressNotesQuery(profile.id))
}
