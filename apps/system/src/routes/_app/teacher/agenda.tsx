import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { calendarSearchShape } from '@/features/schedule/calendarSearch'
import { TeacherAgenda } from '@/features/teacher/components/TeacherAgenda'
import { TeacherGate } from '@/features/teacher/components/TeacherGate'

const searchSchema = z.object({
  ...calendarSearchShape,
  session: z.string().optional().catch(undefined),
})

export const Route = createFileRoute('/_app/teacher/agenda')({
  validateSearch: (search) => searchSchema.parse(search),
  component: TeacherAgendaRoute,
})

function TeacherAgendaRoute() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <TeacherGate>
      {(teacher) => (
        <TeacherAgenda
          teacher={teacher}
          search={search}
          onSearchChange={(patch) => void navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true })}
        />
      )}
    </TeacherGate>
  )
}
