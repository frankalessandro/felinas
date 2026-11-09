import { createFileRoute } from '@tanstack/react-router'
import { BookClassesScreen } from '@/features/bookings/components/BookClassesScreen'
import { bookSearchSchema } from '@/features/bookings/searchSchema'

export const Route = createFileRoute('/_app/student/book')({
  validateSearch: bookSearchSchema,
  component: BookRoute,
})

function BookRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <BookClassesScreen
      search={search}
      onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })}
    />
  )
}
