import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { StudentsPage } from '@/features/students/components/StudentsPage'

const searchSchema = z.object({
  q: z.string().optional().catch(undefined),
  status: z.enum(['active', 'inactive', 'all']).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/students/')({
  validateSearch: searchSchema,
  component: StudentsRoute,
})

function StudentsRoute() {
  const { q = '', status = 'active' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <StudentsPage
      q={q}
      status={status}
      onSearchChange={(next) => navigate({ search: (prev) => ({ ...prev, q: next || undefined }), replace: true })}
      onStatusChange={(next) => navigate({ search: (prev) => ({ ...prev, status: next }), replace: true })}
    />
  )
}
