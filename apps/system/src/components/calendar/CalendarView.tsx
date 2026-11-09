import type { ReactNode } from 'react'
import { addDays, addMonths, startOfMonth } from 'date-fns'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import { academyToday, getWeekStart, isSameAcademyMonth, toAcademyTime, type CalendarViewMode } from '@/lib/dates'
import { AgendaList } from './AgendaList'
import { CalendarToolbar } from './CalendarToolbar'
import { DayStrip } from './DayStrip'
import { MonthGrid } from './MonthGrid'
import { WeekGrid } from './WeekGrid'
import type { CalendarEvent, CalendarHighlight } from './types'

const NO_HIGHLIGHTS: CalendarHighlight[] = []

interface CalendarViewProps {
  view: CalendarViewMode
  onViewChange: (view: CalendarViewMode) => void
  /** Fecha ancla: define el mes/semana visible y, en móvil, el día seleccionado. */
  date: Date
  onDateChange: (date: Date) => void
  events: CalendarEvent[]
  onEventClick?: (event: CalendarEvent) => void
  /** Eventos de la academia (shows, batallas): se pintan aparte, en dorado, y no son clases. */
  highlights?: CalendarHighlight[]
  onHighlightClick?: (highlight: CalendarHighlight) => void
  /** Hueco vacío en la semana (ej. crear clase). */
  onSlotClick?: (date: Date) => void
  /** Acción a la derecha de cada tarjeta en la agenda móvil (ej. Reservar). */
  renderAction?: (event: CalendarEvent) => ReactNode
}

const DESKTOP_QUERY = '(min-width: 768px)'

/** Al saltar de mes, quedarse en hoy si cae en ese mes; si no, en el día 1. */
function monthAnchor(target: Date): Date {
  const today = academyToday()
  return isSameAcademyMonth(target, today) ? today : toAcademyTime(startOfMonth(toAcademyTime(target)))
}

export function CalendarView({
  view,
  onViewChange,
  date,
  onDateChange,
  events,
  onEventClick,
  highlights = NO_HIGHLIGHTS,
  onHighlightClick,
  onSlotClick,
  renderAction,
}: CalendarViewProps) {
  const isDesktop = useMediaQuery(DESKTOP_QUERY)

  function shift(direction: 1 | -1) {
    onDateChange(view === 'month' ? monthAnchor(addMonths(toAcademyTime(date), direction)) : addDays(toAcademyTime(date), 7 * direction))
  }

  function openWeek(day: Date) {
    onDateChange(day)
    onViewChange('week')
  }

  const dayAgenda = <AgendaList
      days={[date]}
      events={events}
      highlights={highlights}
      onHighlightClick={onHighlightClick}
      onEventClick={onEventClick}
      renderAction={renderAction}
    />

  return (
    <div className="flex flex-col gap-5">
      <CalendarToolbar
        view={view}
        date={date}
        onPrev={() => shift(-1)}
        onNext={() => shift(1)}
        onToday={() => onDateChange(academyToday())}
        onViewChange={onViewChange}
      />

      {view === 'month' && isDesktop && (
        <MonthGrid
          date={date}
          events={events}
          highlights={highlights}
          onDayClick={openWeek}
          onEventClick={onEventClick}
          onHighlightClick={onHighlightClick}
        />
      )}
      {view === 'month' && !isDesktop && (
        <>
          <MonthGrid compact date={date} events={events} highlights={highlights} selectedDay={date} onDayClick={onDateChange} />
          {dayAgenda}
        </>
      )}
      {view === 'week' && isDesktop && (
        <WeekGrid
          weekStart={getWeekStart(date)}
          events={events}
          highlights={highlights}
          onHighlightClick={onHighlightClick}
          onEventClick={onEventClick}
          onSlotClick={onSlotClick}
        />
      )}
      {view === 'week' && !isDesktop && (
        <>
          <DayStrip weekStart={getWeekStart(date)} events={events} highlights={highlights} selectedDay={date} onSelect={onDateChange} />
          {dayAgenda}
        </>
      )}
    </div>
  )
}
