import { useMutation, useQueryClient } from '@tanstack/react-query'
import { authKeys } from '@/features/auth/queries'
import { toastSuccess } from '@/lib/mutationToasts'
import { updateMyProfile } from '../api/profile.api'

export function useUpdateMyProfile() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (profile) => {
      queryClient.setQueryData(authKeys.profile(profile.id), profile)
      toastSuccess('Perfil actualizado', 'Tus datos quedaron guardados.')
    },
  })
}
