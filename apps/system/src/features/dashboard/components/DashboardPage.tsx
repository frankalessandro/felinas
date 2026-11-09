import { useQuery } from '@tanstack/react-query'
import { endOfMonth, startOfMonth, subMonths } from 'date-fns'
import { CalendarCheck, HandCoins, Sparkles, TicketCheck, Wallet } from 'lucide-react'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { BirthdaysCard } from '@/features/birthdays/components/BirthdaysCard'
import { firstName } from '@/features/birthdays/lib'
import { sessionsQuery } from '@/features/schedule/queries'
import { PageHeader, StatCard } from '@/components/ui'
import { academyNow, academyToday, formatters, getWeekRange, getWeekStart, toDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import { getCurrentMonthRange } from '../month'
import { collectedQuery, outstandingBalanceQuery, pendingUsersCountQuery } from '../queries'
import { countBookings, countScheduled } from '../stats'
import { countAtRisk } from '../weekRisk'
import { AlertsPanel } from './AlertsPanel'
import { PendingApprovals } from './PendingApprovals'
import { QuickLinks } from './QuickLinks'
import { WeekClasses } from './WeekClasses'

const NOON = 12
const EVENING = 19
const PERCENT = 100

function getGreeting(): string {
  const hour = academyNow().getHours()
  if (hour < NOON) return 'Buenos días,'
  if (hour < EVENING) return 'Buenas tardes,'
  return 'Buenas noches,'
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function getPreviousMonthRange(): { from: string; to: string } {
  const previous = subMonths(academyToday(), 1)
  return { from: toDateKey(startOfMonth(previous)), to: toDateKey(endOfMonth(previous)) }
}

function getCollectedTrend(current: number | undefined, previous: number | undefined) {
  if (current === undefined || previous === undefined || previous <= 0) return undefined
  const change = Math.round(((current - previous) / previous) * PERCENT)
  if (change === 0) return { label: 'Igual que el mes pasado', tone: 'neutral' as const }
  return { label: `${change > 0 ? '+' : ''}${change}% vs. mes pasado`, tone: change > 0 ? ('ok' as const) : ('danger' as const) }
}

function describeStudents(students: number): string {
  return students === 1 ? 'De 1 alumna' : `De ${students} alumnas`
}

/** Portada del admin: saludo, pulso del día en cuatro cifras, clases de hoy y avisos accionables. */
export function DashboardPage() {
  const profile = useCurrentProfile()
  const week = useQuery(sessionsQuery(getWeekRange(getWeekStart(new Date()))))
  const pending = useQuery(pendingUsersCountQuery())
  const collected = useQuery(collectedQuery(getCurrentMonthRange()))
  const previousCollected = useQuery(collectedQuery(getPreviousMonthRange()))
  const outstanding = useQuery(outstandingBalanceQuery())

  const weekSessions = week.data ?? []
  const atRisk = countAtRisk(weekSessions, Date.now())

  return (
    <div className="flex flex-col gap-6">
      <div className="relative isolate">
        <span aria-hidden className="pointer-events-none absolute -left-10 -top-16 -z-10 h-56 w-2/3 rounded-full bg-gradient-felinas opacity-[0.12] blur-3xl" />
        <PageHeader
          eyebrow={capitalize(formatters.fullDate(academyToday()))}
          title={getGreeting()}
          accent={firstName(profile.full_name, 'equipo')}
          description="Así va la semana en la academia."
          icon={Sparkles}
        />
      </div>

      <PendingApprovals count={pending.data ?? 0} />

      <section aria-label="Resumen" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Clases esta semana"
          icon={CalendarCheck}
          tone="rosa"
          value={week.data ? countScheduled(weekSessions) : '—'}
          hint={week.isError ? 'No se pudo cargar' : week.data ? `${countBookings(weekSessions)} reservas en total` : undefined}
        />
        <StatCard
          label="En riesgo"
          icon={TicketCheck}
          tone={atRisk > 0 ? 'warn' : 'default'}
          value={week.data ? atRisk : '—'}
          hint={week.isError ? 'No se pudo cargar' : 'Clases que no llegan al mínimo de reservas'}
        />
        <StatCard
          label="Cobrado este mes"
          icon={Wallet}
          tone="dorado"
          value={collected.data === undefined ? '—' : formatCOP(collected.data)}
          trend={getCollectedTrend(collected.data, previousCollected.data)}
          hint={collected.isError ? 'No se pudo cargar' : capitalize(formatters.monthYear(academyToday()))}
        />
        <StatCard
          label="Por cobrar"
          icon={HandCoins}
          tone={outstanding.data && outstanding.data.total > 0 ? 'warn' : 'default'}
          value={outstanding.data === undefined ? '—' : formatCOP(outstanding.data.total)}
          hint={outstanding.isError ? 'No se pudo cargar' : outstanding.data ? describeStudents(outstanding.data.students) : undefined}
        />
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <WeekClasses sessions={week.data} isLoading={week.isLoading} error={week.error} onRetry={() => void week.refetch()} />
        </div>
        <div className="flex flex-col gap-6 lg:col-span-4">
          <AlertsPanel />
          <BirthdaysCard />
        </div>
      </div>

      <QuickLinks />
    </div>
  )
}
