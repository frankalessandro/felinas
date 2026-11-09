import { createFileRoute } from '@tanstack/react-router'
import { StudentHomeScreen } from '@/features/bookings/components/StudentHomeScreen'

export const Route = createFileRoute('/_app/student/')({
  component: StudentHomeScreen,
})
