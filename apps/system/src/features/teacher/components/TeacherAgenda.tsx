import { CalendarDays } from 'lucide-react'
import { CalendarView } from '@/components/calendar'
import { ErrorState, PageHeader } from '@/components/ui'
import { resolveCalendarSearch, type CalendarSearch } from '@/features/schedule/calendarSearch'
import { useCalendarSessions } from '@/features/schedule/hooks/useCalendarSessions'
import { toCalendarEvent } from '@/features/schedule/mappers'
import { toDateKey } from '@/lib/dates'
import type { Teacher } from '../types'
import { SessionDetailDialog } from './SessionDetailDialog'

type AgendaSearch = CalendarSearch & { session?: string }

interface TeacherAgendaProps {
  teacher: Teacher
  search: AgendaSearch
  onSearchChange: (patch: Partial<AgendaSearch>) => void
}

export function TeacherAgenda({ teacher, search, onSearchChange }: TeacherAgendaProps) {
  const { view, date } = resolveCalendarSearch(search)
  const { data, isLoading, isPlaceholderData, error, refetch } = useCalendarSessions(view, date, { teacherId: teacher.id })
  const events = (data ?? []).map((session) => toCalendarEvent(session))

  return (
    <div aria-busy={isLoading || isPlaceholderData} className="flex flex-col gap-6">
      <PageHeader icon={CalendarDays} title="Mi agenda" description="Toca una clase para ver quién reservó." />
      {error && <ErrorState message={error.message} onRetry={() => void refetch()} />}
      {/* El calendario sigue visible al cambiar de periodo para no perder la navegación mientras carga. */}
      <div className={isPlaceholderData ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
        <CalendarView
          view={view}
          onViewChange={(next) => onSearchChange({ view: next })}
          date={date}
          onDateChange={(next) => onSearchChange({ date: toDateKey(next) })}
          events={events}
          onEventClick={(event) => onSearchChange({ session: event.id })}
        />
      </div>
      {search.session && <SessionDetailDialog sessionId={search.session} onClose={() => onSearchChange({ session: undefined })} />}
    </div>
  )
}
