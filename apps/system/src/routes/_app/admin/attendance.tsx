import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AttendancePage } from '@/features/attendance/components/AttendancePage'
import { getDayRange, getTodayKey } from '@/features/attendance/day'
import { sessionsQuery } from '@/features/schedule/queries'

/** `day` se acepta por compatibilidad con enlaces viejos; la asistencia siempre es la de hoy. */
const searchSchema = z.object({
  day: z.string().optional().catch(undefined),
  session: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/attendance')({
  validateSearch: (search) => searchSchema.parse(search),
  loader: ({ context }) => context.queryClient.ensureQueryData(sessionsQuery(getDayRange(getTodayKey()))),
  component: AttendancePage,
})
