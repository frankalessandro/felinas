import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Avatar, Badge, Dialog, Skeleton } from '@/components/ui'
import { WEEKDAYS } from '@/features/classes/constants'
import { formatTimeRange } from '@/features/classes/format'
import { getTeacherColor } from '../lib'
import { upcomingSessionsCountQuery } from '../queries'
import type { TeacherSchedule, TeacherWithSchedules } from '../types'

interface TeacherDetailDialogProps {
  teacher: TeacherWithSchedules
  onClose: () => void
}

function UpcomingCount({ teacherId }: { teacherId: string }) {
  const { data, isLoading, isError } = useQuery(upcomingSessionsCountQuery(teacherId))
  if (isLoading) return <Skeleton className="h-16" />
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-line bg-surface-2/60 p-4">
      <IconTile icon={CalendarCheck} tone="rosa" />
      <div>
        <p className="font-display text-2xl font-bold leading-none tabular-nums">{isError ? '—' : data}</p>
        <p className="text-xs text-fg-muted">sesiones próximas programadas</p>
      </div>
    </div>
  )
}

function sortByTime(schedules: TeacherSchedule[]): TeacherSchedule[] {
  return [...schedules].sort((a, b) => a.start_time.localeCompare(b.start_time))
}

export function TeacherDetailDialog({ teacher, onClose }: TeacherDetailDialogProps) {
  const color = getTeacherColor(teacher)
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()} title={teacher.full_name} description={teacher.bio ?? 'Sin bio registrada.'} className="md:max-w-xl">
      <div className="flex flex-col gap-5 pb-2">
        <div className="flex items-center gap-3">
          <Avatar name={teacher.full_name} src={teacher.photo_url} size="lg" />
          <span aria-hidden className="size-4 rounded-full" style={{ backgroundColor: color }} />
          {!teacher.active && <Badge tone="warn">Inactiva</Badge>}
        </div>

        <UpcomingCount teacherId={teacher.id} />

        <section aria-labelledby="teacher-week" className="flex flex-col gap-3">
          <h3 id="teacher-week" className="font-display text-sm font-bold text-fg">
            Horario semanal
          </h3>
          {teacher.schedules.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line px-4 py-5 text-center text-sm text-fg-subtle">Aún no tiene horarios asignados.</p>
          ) : (
            WEEKDAYS.map((day) => {
              const items = sortByTime(teacher.schedules.filter((schedule) => schedule.weekday === day.value))
              if (items.length === 0) return null
              return (
                <div key={day.value} className="flex gap-3">
                  <span className="w-12 shrink-0 pt-2 font-display text-sm font-bold capitalize text-rosa-hover">{day.short}</span>
                  <ul className="flex flex-1 flex-col gap-2">
                    {items.map((schedule) => (
                      <li key={schedule.id} className="flex items-center gap-3 rounded-xl border border-line bg-surface-2/60 px-3 py-2.5">
                        <span aria-hidden className="h-8 w-1 rounded-full" style={{ backgroundColor: schedule.class_type?.color ?? color }} />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="truncate text-sm font-semibold">{schedule.class_type?.name ?? 'Estilo'}</span>
                          <span className="text-xs text-fg-muted">
                            {formatTimeRange(schedule.start_time, schedule.end_time)} · {schedule.room?.name ?? 'Sin salón'}
                          </span>
                        </div>
                        {!schedule.active && <Badge tone="warn">Pausado</Badge>}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })
          )}
        </section>
      </div>
    </Dialog>
  )
}
