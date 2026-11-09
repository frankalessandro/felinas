import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { authKeys } from '@/features/auth/queries'
import { completeOnboarding } from '../api/onboarding.api'

/** Al terminar, el perfil ya trae `onboarded_at`: se guarda en caché y "/" reparte a pendiente o al inicio del rol. */
export function useCompleteOnboarding() {
  const queryClient = useQueryClient()
  const router = useRouter()
  return useMutation({
    mutationFn: completeOnboarding,
    onSuccess: async (profile) => {
      queryClient.setQueryData(authKeys.profile(profile.id), profile)
      await router.navigate({ to: '/' })
    },
  })
}
