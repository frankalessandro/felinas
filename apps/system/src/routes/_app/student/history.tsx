import { createFileRoute } from '@tanstack/react-router'
import { HistoryScreen } from '@/features/bookings/components/HistoryScreen'
import { historySearchSchema } from '@/features/bookings/searchSchema'

export const Route = createFileRoute('/_app/student/history')({
  validateSearch: historySearchSchema,
  component: HistoryRoute,
})

function HistoryRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <HistoryScreen
      search={search}
      onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })}
    />
  )
}
