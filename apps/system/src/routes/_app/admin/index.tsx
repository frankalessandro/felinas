import { createFileRoute } from '@tanstack/react-router'
import { getDayRange, getTodayKey } from '@/features/attendance/day'
import { DashboardPage } from '@/features/dashboard/components/DashboardPage'
import { sessionsQuery } from '@/features/schedule/queries'

export const Route = createFileRoute('/_app/admin/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery(getDayRange(getTodayKey()))),
  component: DashboardPage,
})
