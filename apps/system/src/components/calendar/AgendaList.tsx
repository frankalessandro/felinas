import type { ReactNode } from 'react'
import { EmptyState } from '@/components/ui'
import { formatters, isSameAcademyDay, toDateKey } from '@/lib/dates'
import { EventCard } from './EventCard'
import { HighlightCard } from './HighlightCard'
import { groupEventsByDay, groupHighlightsByDay } from './lib'
import type { CalendarEvent, CalendarHighlight } from './types'

const NO_HIGHLIGHTS: CalendarHighlight[] = []

interface AgendaListProps {
  /** Días a mostrar, en orden. Con un solo día no se dibuja el encabezado. */
  days: Date[]
  events: CalendarEvent[]
  /** Eventos de la academia: van arriba de las clases de su día. */
  highlights?: CalendarHighlight[]
  onHighlightClick?: (highlight: CalendarHighlight) => void
  onEventClick?: (event: CalendarEvent) => void
  renderAction?: (event: CalendarEvent) => ReactNode
  /** Oculta los días sin clases (útil en la lista semanal). */
  hideEmptyDays?: boolean
  emptyMessage?: string
}

export function AgendaList({
  days,
  events,
  highlights = NO_HIGHLIGHTS,
  onHighlightClick,
  onEventClick,
  renderAction,
  hideEmptyDays = false,
  emptyMessage = 'No hay clases este día',
}: AgendaListProps) {
  const byDay = groupEventsByDay(events, days)
  const highlightsByDay = groupHighlightsByDay(highlights, days)
  const hasContent = (day: Date) => (byDay.get(toDateKey(day))?.length ?? 0) + (highlightsByDay.get(toDateKey(day))?.length ?? 0) > 0
  const visibleDays = hideEmptyDays ? days.filter(hasContent) : days
  const showHeaders = days.length > 1

  if (visibleDays.length === 0) {
    return <EmptyState illustration="calendar" title={emptyMessage} description="Prueba con otro día o revisa la semana siguiente." />
  }

  return (
    <div className="flex flex-col gap-6">
      {visibleDays.map((day) => {
        const dayEvents = byDay.get(toDateKey(day)) ?? []
        const dayHighlights = highlightsByDay.get(toDateKey(day)) ?? []
        return (
          <section key={toDateKey(day)} aria-label={formatters.fullDate(day)} className="flex flex-col gap-3">
            {showHeaders && (
              <h3 className="sticky top-0 z-10 -mx-1 flex items-center gap-2 bg-bg/90 px-1 py-2 font-display text-sm font-bold capitalize backdrop-blur">
                {formatters.fullDate(day)}
                {isSameAcademyDay(day, new Date()) && <span className="rounded-full bg-rosa px-2 py-0.5 text-[11px] font-semibold text-white">Hoy</span>}
              </h3>
            )}
            {dayHighlights.length > 0 && (
              <ul className="flex flex-col gap-3">
                {dayHighlights.map((highlight) => (
                  <li key={highlight.id}>
                    <HighlightCard highlight={highlight} onClick={onHighlightClick} />
                  </li>
                ))}
              </ul>
            )}
            {dayEvents.length === 0 ? (
              dayHighlights.length === 0 ? (
                <EmptyState illustration="calendar" title={emptyMessage} className="py-6" />
              ) : (
                <p className="px-1 text-sm text-fg-muted">Sin clases este día.</p>
              )
            ) : (
              <ul className="flex flex-col gap-3">
                {dayEvents.map((event) => (
                  <li key={event.id}>
                    <EventCard event={event} onClick={onEventClick} action={renderAction?.(event)} />
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
