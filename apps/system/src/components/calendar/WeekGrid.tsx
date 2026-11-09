import { useState, useEffect } from 'react'
import type { MouseEvent } from 'react'
import { Ban, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { academyNow, formatters, getWeekDays, isSameAcademyDay, toDateKey } from '@/lib/dates'
import { dateAtMinutes, describeEvent, formatHourLabel, getMinutesOfDay, getVisibleRange, describeHighlight, groupEventsByDay, groupHighlightsByDay, layoutDayEvents, tintedBackground } from './lib'
import { SeatPips } from './SeatPips'
import type { CalendarEvent, CalendarHighlight, PositionedEvent } from './types'

const PX_PER_HOUR = 80
const SLOT_MINUTES = 30
const NOW_REFRESH_MS = 60_000
const NO_HIGHLIGHTS: CalendarHighlight[] = []
const CANCELLED_STRIPES = 'repeating-linear-gradient(135deg, transparent 0 6px, #ffffff0d 6px 12px)'

interface WeekGridProps {
  weekStart: Date
  events: CalendarEvent[]
  /** Eventos de la academia: fila "todo el día" con chips dorados. */
  highlights?: CalendarHighlight[]
  onHighlightClick?: (highlight: CalendarHighlight) => void
  onEventClick?: (event: CalendarEvent) => void
  /** Si se pasa, hacer clic en un hueco vacío devuelve la fecha/hora (redondeada a 30 min). */
  onSlotClick?: (date: Date) => void
  className?: string
}

function useNow(): Date {
  const [now, setNow] = useState(() => academyNow())
  useEffect(() => {
    const id = window.setInterval(() => setNow(academyNow()), NOW_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [])
  return now
}

export function WeekGrid({ weekStart, events, highlights = NO_HIGHLIGHTS, onHighlightClick, onEventClick, onSlotClick, className }: WeekGridProps) {
  const now = useNow()
  const days = getWeekDays(weekStart)
  const range = getVisibleRange(events)
  const byDay = groupEventsByDay(events, days)
  const highlightsByDay = groupHighlightsByDay(highlights, days)
  const hasHighlights = highlights.length > 0
  const hours = Array.from({ length: range.endHour - range.startHour }, (_, i) => range.startHour + i)
  const bodyHeight = hours.length * PX_PER_HOUR
  const nowMinutes = getMinutesOfDay(now)
  const nowTop = ((nowMinutes - range.startHour * 60) / ((range.endHour - range.startHour) * 60)) * 100
  const showNowLine = nowTop >= 0 && nowTop <= 100

  function handleSlotClick(day: Date, e: MouseEvent<HTMLDivElement>) {
    if (!onSlotClick || e.target !== e.currentTarget) return
    const rect = e.currentTarget.getBoundingClientRect()
    const minutesFromStart = ((e.clientY - rect.top) / PX_PER_HOUR) * 60
    const snapped = Math.floor(minutesFromStart / SLOT_MINUTES) * SLOT_MINUTES
    onSlotClick(dateAtMinutes(day, range.startHour * 60 + snapped))
  }

  return (
    <div className={cn('relative isolate max-h-[calc(100dvh-13rem)] min-h-96 overflow-auto rounded-2xl border border-line bg-surface shadow-card', className)}>
      <div className="grid min-w-[52rem] grid-cols-[3.5rem_repeat(7,minmax(7rem,1fr))]">
        <div className="sticky left-0 top-0 z-30 border-b border-r border-line bg-surface-2" />
        {days.map((day) => {
          const isToday = isSameAcademyDay(day, now)
          return (
            <div
              key={toDateKey(day)}
              className={cn('sticky top-0 z-20 flex flex-col items-center gap-0.5 border-b border-l border-line bg-surface-2 py-2', isToday && 'bg-[color-mix(in_srgb,var(--color-rosa)_10%,var(--color-surface-2))]')}
            >
              <span className="text-xs font-semibold capitalize text-fg-muted">{formatters.weekdayShort(day)}</span>
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-full font-display text-lg font-bold tabular-nums',
                  isToday ? 'bg-gradient-felinas text-white shadow-glow' : 'text-fg',
                )}
                aria-current={isToday ? 'date' : undefined}
              >
                {formatters.dayNumber(day)}
              </span>
            </div>
          )
        })}

        {hasHighlights && (
          <>
            <div className="sticky left-0 z-10 flex items-center justify-end border-b border-r border-line bg-surface-2 pr-2 text-[11px] font-semibold text-ambar">
              Evento
            </div>
            {days.map((day) => (
              <ul key={toDateKey(day)} className="flex min-h-10 flex-col gap-1 border-b border-l border-line bg-ambar-soft p-1">
                {(highlightsByDay.get(toDateKey(day)) ?? []).map((highlight) => (
                  <li key={highlight.id}>
                    <button
                      type="button"
                      onClick={() => onHighlightClick?.(highlight)}
                      aria-label={describeHighlight(highlight)}
                      className="flex w-full min-w-0 items-center gap-1 rounded-md bg-ambar-soft px-1.5 py-1 text-left text-[11px] font-semibold leading-tight text-ambar ring-1 ring-inset ring-ambar/30 transition hover:bg-ambar/25"
                    >
                      <Sparkles className="size-3 shrink-0" aria-hidden />
                      <span className="truncate">{highlight.title}</span>
                    </button>
                  </li>
                ))}
              </ul>
            ))}
          </>
        )}

        <div className="sticky left-0 z-10 border-r border-line bg-surface-2" style={{ height: bodyHeight }}>
          {hours.slice(1).map((hour, i) => (
            <span
              key={hour}
              className="absolute right-2 -translate-y-1/2 text-[11px] font-medium text-fg-subtle"
              style={{ top: (i + 1) * PX_PER_HOUR }}
            >
              {formatHourLabel(hour)}
            </span>
          ))}
        </div>

        {days.map((day) => {
          const isToday = isSameAcademyDay(day, now)
          const positioned = layoutDayEvents(byDay.get(toDateKey(day)) ?? [], range)
          return (
            <div
              key={toDateKey(day)}
              onClick={(e) => handleSlotClick(day, e)}
              className={cn('relative border-l border-line', isToday ? 'bg-rosa/[0.04]' : 'bg-surface', onSlotClick && 'cursor-cell')}
              style={{
                height: bodyHeight,
                backgroundImage: 'linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)',
                backgroundSize: `100% ${PX_PER_HOUR}px`,
              }}
            >
              {positioned.map((item) => (
                <EventBlock key={item.event.id} item={item} bodyHeight={bodyHeight} onClick={onEventClick} />
              ))}
              {isToday && showNowLine && (
                <div aria-hidden className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: `${nowTop}%` }}>
                  <span className="-ml-1 size-2.5 rounded-full bg-rosa-hover shadow-glow" />
                  <span className="h-0.5 flex-1 bg-rosa-hover" />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface EventBlockProps {
  item: PositionedEvent
  bodyHeight: number
  onClick?: (event: CalendarEvent) => void
}

const MIN_BLOCK_HEIGHT = 28
const MIN_HEIGHT_FOR_BAR = 56
const MIN_HEIGHT_FOR_DETAILS = 72

function EventBlock({ item, bodyHeight, onClick }: EventBlockProps) {
  const { event } = item
  const cancelled = event.status === 'cancelled'
  const heightPx = Math.max((item.heightPct / 100) * bodyHeight, MIN_BLOCK_HEIGHT)
  const details = [event.teacherName, event.roomName].filter(Boolean).join(' · ')

  return (
    <button
      type="button"
      aria-label={describeEvent(event)}
      onClick={() => onClick?.(event)}
      className={cn(
        'absolute flex flex-col gap-0.5 overflow-hidden rounded-lg px-2 py-1.5 text-left text-xs transition-[transform,box-shadow] hover:z-20 active:scale-[.99]',
        (cancelled || event.disabled) && 'opacity-60',
      )}
      style={{
        top: `${item.topPct}%`,
        height: heightPx,
        left: `calc(${(item.column / item.columns) * 100}% + 2px)`,
        width: `calc(${100 / item.columns}% - 4px)`,
        backgroundColor: tintedBackground(event.color, 18),
        backgroundImage: cancelled ? CANCELLED_STRIPES : undefined,
        boxShadow: `inset 3px 0 0 ${event.color}`,
      }}
    >
      <span className={cn('truncate pl-1 font-display text-xs font-bold leading-tight', cancelled && 'line-through')}>{event.title}</span>
      <span className="truncate pl-1 text-[11px] font-medium tabular-nums text-fg-muted">{formatters.timeRange(event.startsAt, event.endsAt)}</span>
      {details && heightPx >= MIN_HEIGHT_FOR_DETAILS && <span className="truncate pl-1 text-fg-muted">{details}</span>}
      {heightPx >= MIN_HEIGHT_FOR_BAR &&
        (cancelled ? (
          <span className="mt-auto inline-flex items-center gap-1 pl-1 text-[10px] font-semibold text-danger">
            <Ban className="size-3" aria-hidden />
            Cancelada
          </span>
        ) : (
          <SeatPips booked={event.booked} capacity={event.capacity} color={event.color} compact className="mt-auto pl-1" />
        ))}
    </button>
  )
}
