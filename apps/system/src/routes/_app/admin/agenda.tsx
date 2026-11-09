import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { AgendaPage } from '@/features/sessions-admin/components/AgendaPage'
import { calendarSearchShape, resolveCalendarSearch } from '@/features/schedule/calendarSearch'
import { sessionsQuery } from '@/features/schedule/queries'
import { getCalendarRange } from '@/lib/dates'

const searchSchema = z.object({
  ...calendarSearchShape,
  teacher: z.string().optional().catch(undefined),
  type: z.string().optional().catch(undefined),
  session: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/agenda')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ view: search.view, date: search.date, teacher: search.teacher, type: search.type }),
  loader: ({ context, deps }) => {
    const { view, date } = resolveCalendarSearch(deps)
    return context.queryClient.ensureQueryData(
      sessionsQuery({ ...getCalendarRange(view, date), teacherId: deps.teacher, classTypeId: deps.type }),
    )
  },
  component: AgendaPage,
})
