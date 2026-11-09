import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { TeachersPage } from '@/features/teachers/components/TeachersPage'

const searchSchema = z.object({
  teacher: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/teachers')({
  validateSearch: searchSchema,
  component: TeachersRoute,
})

function TeachersRoute() {
  const { teacher } = Route.useSearch()
  const navigate = Route.useNavigate()
  return <TeachersPage selectedId={teacher} onSelect={(id) => navigate({ search: { teacher: id }, replace: true })} />
}
