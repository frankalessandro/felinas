import { createFileRoute, Outlet } from '@tanstack/react-router'
import { requireActiveUser } from '@/features/auth/guards'
import { AppShell } from '@/components/layout/AppShell'

/** Layout de todas las pantallas autenticadas y aprobadas. */
export const Route = createFileRoute('/_app')({
  beforeLoad: async ({ context }) => requireActiveUser(context.queryClient),
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
})
