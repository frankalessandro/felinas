import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatters, getWeekDays, isSameAcademyDay, toDateKey } from '@/lib/dates'
import { groupEventsByDay, groupHighlightsByDay } from './lib'
import type { CalendarEvent, CalendarHighlight } from './types'

const NO_HIGHLIGHTS: CalendarHighlight[] = []

interface DayStripProps {
  weekStart: Date
  events: CalendarEvent[]
  highlights?: CalendarHighlight[]
  selectedDay: Date
  onSelect: (day: Date) => void
}

export function DayStrip({ weekStart, events, highlights = NO_HIGHLIGHTS, selectedDay, onSelect }: DayStripProps) {
  const days = getWeekDays(weekStart)
  const byDay = groupEventsByDay(events, days)
  const highlightsByDay = groupHighlightsByDay(highlights, days)

  return (
    <div role="group" aria-label="Días de la semana" className="hide-scrollbar -mx-4 flex gap-1.5 overflow-x-auto px-4 py-1">
      {days.map((day) => {
        const dayEvents = byDay.get(toDateKey(day)) ?? []
        const count = dayEvents.length
        const dayHighlights = highlightsByDay.get(toDateKey(day)) ?? []
        const hasHighlight = dayHighlights.length > 0
        const selected = isSameAcademyDay(day, selectedDay)
        return (
          <button
            key={toDateKey(day)}
            type="button"
            aria-pressed={selected}
            aria-label={`${formatters.fullDate(day)}, ${count === 1 ? '1 clase' : `${count} clases`}${hasHighlight ? `, evento: ${dayHighlights.map((h) => h.title).join(', ')}` : ''}`}
            onClick={() => onSelect(day)}
            className={cn(
              'flex min-h-[4.5rem] min-w-12 flex-1 flex-col items-center justify-center gap-1 rounded-xl border transition-[transform,background-color,border-color] active:scale-[.97]',
              selected ? 'border-rosa bg-rosa text-white shadow-glow' : 'border-line bg-surface text-fg hover:border-line-strong',
            )}
          >
            <span className={cn('text-[11px] font-semibold capitalize', selected ? 'text-white' : 'text-fg-muted')}>{formatters.weekdayShort(day)}</span>
            <span className="font-display text-xl font-bold leading-none tabular-nums">{formatters.dayNumber(day)}</span>
            <span aria-hidden className="flex h-2 items-center gap-0.5">
              {dayEvents.slice(0, 3).map((event) => (
                <span key={event.id} className="size-1.5 rounded-full" style={{ background: selected ? '#fff' : event.color }} />
              ))}
              {hasHighlight && <Sparkles className={cn('size-2.5', selected ? 'text-white' : 'text-ambar')} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
