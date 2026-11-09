import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatters, getMonthGridDays, isSameAcademyDay, isSameAcademyMonth, toDateKey } from '@/lib/dates'
import { describeEvent, describeHighlight, groupEventsByDay, groupHighlightsByDay } from './lib'
import type { CalendarEvent, CalendarHighlight } from './types'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MAX_ITEMS = 3
const MAX_DOTS = 3
const NO_HIGHLIGHTS: CalendarHighlight[] = []

interface MonthGridProps {
  /** Cualquier fecha del mes a mostrar. */
  date: Date
  events: CalendarEvent[]
  /** Eventos de la academia: se muestran como chips ámbar con estrella. */
  highlights?: CalendarHighlight[]
  selectedDay?: Date
  onDayClick: (day: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onHighlightClick?: (highlight: CalendarHighlight) => void
  /** Móvil: celdas pequeñas con puntos de color en vez de chips con texto. */
  compact?: boolean
}

export function MonthGrid({
  date,
  events,
  highlights = NO_HIGHLIGHTS,
  selectedDay,
  onDayClick,
  onEventClick,
  onHighlightClick,
  compact = false,
}: MonthGridProps) {
  const days = getMonthGridDays(date)
  const byDay = groupEventsByDay(events, days)
  const highlightsByDay = groupHighlightsByDay(highlights, days)
  const today = new Date()

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface shadow-card">
      <div className="grid grid-cols-7 border-b border-line bg-surface-2/60">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="py-2.5 text-center text-xs font-semibold text-fg-muted">
            {compact ? label.charAt(0) : label}
          </div>
        ))}
      </div>
      <div role="grid" aria-label={formatters.monthYear(date)} className="grid grid-cols-7 gap-px bg-line">
        {days.map((day) => {
          const key = toDateKey(day)
          const cellProps = {
            day,
            events: byDay.get(key) ?? [],
            highlights: highlightsByDay.get(key) ?? [],
            inMonth: isSameAcademyMonth(day, date),
            isToday: isSameAcademyDay(day, today),
            isSelected: selectedDay ? isSameAcademyDay(day, selectedDay) : false,
            onDayClick,
          }
          return compact ? (
            <CompactDayCell key={key} {...cellProps} />
          ) : (
            <DayCell key={key} {...cellProps} onEventClick={onEventClick} onHighlightClick={onHighlightClick} />
          )
        })}
      </div>
    </div>
  )
}

interface DayCellProps {
  day: Date
  events: CalendarEvent[]
  highlights: CalendarHighlight[]
  inMonth: boolean
  isToday: boolean
  isSelected: boolean
  onDayClick: (day: Date) => void
  onEventClick?: (event: CalendarEvent) => void
  onHighlightClick?: (highlight: CalendarHighlight) => void
}

function dayLabel(day: Date, classes: number, highlights: CalendarHighlight[]): string {
  const parts = [formatters.fullDate(day), classes === 0 ? 'sin clases' : classes === 1 ? '1 clase' : `${classes} clases`]
  if (highlights.length > 0) parts.push(`evento: ${highlights.map((h) => h.title).join(', ')}`)
  return parts.join(', ')
}

function DayNumber({ day, isToday, inMonth }: { day: Date; isToday: boolean; inMonth: boolean }) {
  return (
    <span
      className={cn(
        'grid size-7 place-items-center rounded-full text-sm font-semibold tabular-nums',
        isToday ? 'bg-gradient-felinas text-white shadow-glow' : inMonth ? 'text-fg' : 'text-fg-subtle',
      )}
    >
      {formatters.dayNumber(day)}
    </span>
  )
}

function DayCell({ day, events, highlights, inMonth, isToday, isSelected, onDayClick, onEventClick, onHighlightClick }: DayCellProps) {
  const items = [
    ...highlights.map((highlight) => ({ kind: 'highlight' as const, highlight })),
    ...events.map((event) => ({ kind: 'event' as const, event })),
  ]
  const visible = items.slice(0, MAX_ITEMS)
  const hidden = items.length - visible.length

  return (
    <div
      role="gridcell"
      className={cn(
        'group relative flex min-h-32 flex-col gap-1 p-1.5 transition-colors',
        inMonth ? 'bg-surface' : 'bg-bg/60',
        isSelected && 'ring-2 ring-inset ring-rosa',
      )}
    >
      <button
        type="button"
        onClick={() => onDayClick(day)}
        aria-label={`Ver semana del ${dayLabel(day, events.length, highlights)}`}
        className="absolute inset-0 transition-colors hover:bg-white/[0.03] focus-visible:z-10"
      />
      <div className="pointer-events-none relative flex items-center justify-between">
        <DayNumber day={day} isToday={isToday} inMonth={inMonth} />
      </div>
      <ul className="relative flex flex-col gap-1">
        {visible.map((item) =>
          item.kind === 'highlight' ? (
            <li key={`h-${item.highlight.id}`}>
              <HighlightChip highlight={item.highlight} onClick={onHighlightClick ?? (() => onDayClick(day))} />
            </li>
          ) : (
            <li key={item.event.id}>
              <EventChip event={item.event} onClick={onEventClick} />
            </li>
          ),
        )}
      </ul>
      {hidden > 0 && (
        <button
          type="button"
          onClick={() => onDayClick(day)}
          className="relative min-h-6 self-start rounded-md px-1.5 text-[11px] font-semibold text-rosa-hover hover:bg-rosa-soft"
        >
          +{hidden} más
        </button>
      )}
    </div>
  )
}

function HighlightChip({ highlight, onClick }: { highlight: CalendarHighlight; onClick: (highlight: CalendarHighlight) => void }) {
  return (
    <button
      type="button"
      onClick={() => onClick(highlight)}
      aria-label={describeHighlight(highlight)}
      className="flex w-full min-w-0 items-center gap-1 rounded-md bg-ambar-soft px-1.5 py-1 text-left text-[11px] font-semibold leading-tight text-ambar ring-1 ring-inset ring-ambar/30 transition hover:bg-ambar/25 active:scale-[.98]"
    >
      <Sparkles className="size-3 shrink-0" aria-hidden />
      <span className="truncate">{highlight.title}</span>
    </button>
  )
}

function EventChip({ event, onClick }: { event: CalendarEvent; onClick?: (event: CalendarEvent) => void }) {
  const cancelled = event.status === 'cancelled'
  return (
    <button
      type="button"
      onClick={() => onClick?.(event)}
      aria-label={describeEvent(event)}
      style={{ ['--chip' as string]: event.color }}
      className={cn(
        'flex w-full min-w-0 items-center gap-1.5 rounded-md bg-surface-2 py-1 pl-1.5 pr-1 text-left text-[11px] leading-tight shadow-[inset_3px_0_0_var(--chip)] transition',
        'hover:bg-[color-mix(in_srgb,var(--chip)_16%,var(--color-surface-2))] hover:shadow-[inset_3px_0_0_var(--chip),0_0_14px_-4px_var(--chip)] active:scale-[.98]',
        (cancelled || event.disabled) && 'opacity-55',
      )}
    >
      <span className="shrink-0 pl-1 font-semibold tabular-nums text-fg-muted">{formatters.time(event.startsAt).replace(' ', '').toLowerCase()}</span>
      <span className={cn('min-w-0 flex-1 truncate font-semibold text-fg', cancelled && 'line-through')}>{event.title}</span>
      {!cancelled && event.booked >= event.capacity && (
        <span aria-hidden className="shrink-0 rounded-sm bg-danger/20 px-1 text-[9px] font-bold uppercase text-danger">Llena</span>
      )}
    </button>
  )
}

function CompactDayCell({ day, events, highlights, inMonth, isToday, isSelected, onDayClick }: Omit<DayCellProps, 'onEventClick' | 'onHighlightClick'>) {
  const dots = events.slice(0, MAX_DOTS)
  const hasHighlight = highlights.length > 0
  return (
    <button
      type="button"
      role="gridcell"
      aria-selected={isSelected}
      aria-label={dayLabel(day, events.length, highlights)}
      onClick={() => onDayClick(day)}
      className={cn(
        'flex h-14 flex-col items-center justify-center gap-1 transition active:bg-surface-3',
        inMonth ? 'bg-surface' : 'bg-bg/60',
        isSelected && 'bg-rosa-soft',
      )}
    >
      <span
        className={cn(
          'grid size-8 place-items-center rounded-full text-sm font-semibold tabular-nums',
          isSelected ? 'bg-rosa text-white' : isToday ? 'text-rosa-hover ring-1 ring-rosa' : inMonth ? 'text-fg' : 'text-fg-subtle',
        )}
      >
        {formatters.dayNumber(day)}
      </span>
      <span aria-hidden className="flex h-1.5 items-center gap-0.5">
        {dots.map((event) => (
          <span key={event.id} className={cn('size-1.5 rounded-full', event.status === 'cancelled' && 'opacity-40')} style={{ background: event.color }} />
        ))}
        {hasHighlight && <Sparkles className="size-2.5 text-ambar" />}
      </span>
    </button>
  )
}
