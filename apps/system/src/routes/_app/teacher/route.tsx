import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireActiveUser, requireRole } from '@/features/auth/guards'

export const Route = createFileRoute('/_app/teacher')({
  beforeLoad: async ({ context }) => {
    const { profile } = await requireActiveUser(context.queryClient)
    requireRole(profile, 'teacher')
  },
  component: Outlet,
})
