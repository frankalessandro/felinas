import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireActiveUser } from '@/features/auth/guards'
import { BetaRolePicker } from '@/features/dev/components/BetaRolePicker'
import { isDeveloper } from '@/features/dev/effectiveRole'

export const Route = createFileRoute('/beta')({
  beforeLoad: async ({ context }) => {
    const { profile } = await requireActiveUser(context.queryClient)
    if (!isDeveloper(profile)) throw redirect({ to: '/' })
  },
  component: BetaRolePicker,
})
