import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { StudentDetailPage } from '@/features/students/components/StudentDetailPage'

const searchSchema = z.object({
  tab: z.enum(['profile', 'plans', 'history', 'notes']).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/students/$studentId')({
  validateSearch: searchSchema,
  component: StudentDetailRoute,
})

function StudentDetailRoute() {
  const { studentId } = Route.useParams()
  const { tab = 'profile' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return <StudentDetailPage studentId={studentId} tab={tab} onTabChange={(next) => navigate({ search: { tab: next }, replace: true })} />
}
