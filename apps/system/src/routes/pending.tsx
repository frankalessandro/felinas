import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireSession } from '@/features/auth/guards'
import { isApproved } from '@/features/auth/roles'
import { PendingApprovalScreen } from '@/features/auth/components/PendingApprovalScreen'

export const Route = createFileRoute('/pending')({
  beforeLoad: async ({ context }) => {
    const { profile } = await requireSession(context.queryClient)
    if (isApproved(profile)) throw redirect({ to: '/' })
    return { profile }
  },
  component: PendingApprovalScreen,
})
