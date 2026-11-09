import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { UsersPage } from '@/features/users/components/UsersPage'
import type { UsersTab } from '@/features/users/components/UsersPage'

const searchSchema = z.object({
  tab: z.enum(['pending', 'all']).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/users')({
  validateSearch: searchSchema,
  component: UsersRoute,
})

function UsersRoute() {
  const { tab = 'pending' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return <UsersPage tab={tab} onTabChange={(next: UsersTab) => navigate({ search: { tab: next }, replace: true })} />
}
