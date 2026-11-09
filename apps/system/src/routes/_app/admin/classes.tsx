import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ClassesPage } from '@/features/classes/components/ClassesPage'
import type { ClassesTab } from '@/features/classes/components/ClassesPage'

const searchSchema = z.object({
  tab: z.enum(['styles', 'schedules', 'rooms']).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/classes')({
  validateSearch: searchSchema,
  component: ClassesRoute,
})

function ClassesRoute() {
  const { tab = 'styles' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return <ClassesPage tab={tab} onTabChange={(next: ClassesTab) => navigate({ search: { tab: next }, replace: true })} />
}
