import { CalendarDays, Gauge, LayoutDashboard, Users } from 'lucide-react'
import { AsyncContent, EmptyState, PageHeader, StatCard } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { useWeekSessions } from '@/features/schedule/hooks/useWeekSessions'
import { formatters, getWeekStart } from '@/lib/dates'
import { computeWeekStats, findNextSession, getTodaySessions } from '../lib'
import type { Teacher } from '../types'
import { TodayClassCard } from './TodayClassCard'

function getFirstName(fullName: string | null): string {
  return fullName?.trim().split(/\s+/)[0] ?? ''
}

export function TeacherHome({ teacher }: { teacher: Teacher }) {
  const profile = useCurrentProfile()
  const weekStart = getWeekStart(new Date())
  const { data, isLoading, error, refetch } = useWeekSessions(weekStart, { teacherId: teacher.id })

  const sessions = data ?? []
  const stats = computeWeekStats(sessions)
  const today = getTodaySessions(sessions)
  const next = findNextSession(today)
  const now = new Date()

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        icon={LayoutDashboard}
        eyebrow={formatters.fullDate(now)}
        title="Hola,"
        accent={getFirstName(profile.full_name) || getFirstName(teacher.full_name)}
        description="Tu función de hoy y cómo va tu semana en Felinas."
      />

      <AsyncContent isLoading={isLoading} error={error} onRetry={() => void refetch()}>
        <section aria-label="Clases de hoy" className="flex flex-col gap-4">
          <h2 className="font-display text-base font-bold">Tus clases de hoy</h2>
          {today.length === 0 ? (
            <EmptyState illustration="calendar" title="Hoy no tienes clases" description="No tienes clases hoy. Revisa tu agenda para lo que viene." />
          ) : (
            <ol className="relative flex flex-col gap-4 sm:pl-6">
              <span aria-hidden className="absolute bottom-4 left-2 top-4 hidden w-px bg-gradient-to-b from-rosa via-line-strong to-transparent sm:block" />
              {today.map((session) => (
                <li key={session.id} className="relative">
                  <span
                    aria-hidden
                    className="absolute -left-[1.6rem] top-6 hidden size-3 rounded-full border-2 border-rosa bg-bg sm:block"
                  />
                  <TodayClassCard session={session} isNext={session.id === next?.id} isPast={new Date(session.ends_at) <= now} />
                </li>
              ))}
            </ol>
          )}
        </section>

        <section aria-label="Resumen de la semana" className="flex flex-col gap-4">
          <h2 className="font-display text-base font-bold">Tu semana en cifras</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <StatCard label="Clases esta semana" value={stats.classes} icon={CalendarDays} tone="violeta" />
            <StatCard label="Alumnas reservadas" value={stats.bookedStudents} icon={Users} tone="rosa" hint="Reservas confirmadas en la semana" />
            <StatCard label="Ocupación promedio" value={`${stats.occupancyPct}%`} icon={Gauge} tone="ok" hint="Reservas sobre cupos" />
          </div>
        </section>
      </AsyncContent>
    </div>
  )
}
