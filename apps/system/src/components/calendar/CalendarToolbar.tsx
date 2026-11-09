import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { IconTile } from '@/components/brand'
import { cn } from '@/lib/cn'
import { getWeekDays, getWeekStart, toAcademyTime, type CalendarViewMode } from '@/lib/dates'
import { formatWeekRange } from './lib'

const VIEW_OPTIONS: { value: CalendarViewMode; label: string }[] = [
  { value: 'month', label: 'Mes' },
  { value: 'week', label: 'Semana' },
]

const PERIOD_NAME: Record<CalendarViewMode, string> = { month: 'Mes', week: 'Semana' }

interface CalendarToolbarProps {
  view: CalendarViewMode
  date: Date
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  onViewChange: (view: CalendarViewMode) => void
}

const navButton =
  'grid size-11 place-items-center rounded-lg text-fg-muted transition hover:bg-surface-3 hover:text-fg active:scale-95'

function periodTitle(view: CalendarViewMode, date: Date): { main: string; sub: string } {
  const d = toAcademyTime(date)
  if (view === 'week') return { main: formatWeekRange(getWeekDays(getWeekStart(date))), sub: format(d, 'MMMM', { locale: es }) }
  return { main: format(d, 'MMMM', { locale: es }), sub: format(d, 'yyyy') }
}

export function CalendarToolbar({ view, date, onPrev, onNext, onToday, onViewChange }: CalendarToolbarProps) {
  const { main, sub } = periodTitle(view, date)
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
      <div className="flex min-w-0 items-center gap-3">
        <IconTile icon={CalendarDays} tone="rosa" className="hidden sm:grid" />
        <h2 aria-live="polite" className="font-display text-xl font-bold capitalize leading-tight tracking-tight sm:text-2xl">
          {main} <span className="font-medium text-fg-muted">{view === 'month' ? sub : `· ${sub}`}</span>
        </h2>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center rounded-xl bg-surface-2 p-1">
          <button type="button" aria-label={`${PERIOD_NAME[view]} anterior`} onClick={onPrev} className={navButton}>
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={onToday}
            className="min-h-11 rounded-lg px-3 font-display text-sm font-semibold text-fg transition hover:bg-surface-3 active:scale-95"
          >
            Hoy
          </button>
          <button type="button" aria-label={`${PERIOD_NAME[view]} siguiente`} onClick={onNext} className={navButton}>
            <ChevronRight className="size-5" aria-hidden />
          </button>
        </div>
        <div role="radiogroup" aria-label="Vista del calendario" className="relative grid grid-cols-2 rounded-xl bg-surface-2 p-1">
          <span
            aria-hidden
            className={cn(
              'absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-lg bg-surface-3 shadow-card ring-1 ring-line-strong transition-transform duration-200 motion-reduce:transition-none',
              view === 'week' && 'translate-x-full',
            )}
          />
          {VIEW_OPTIONS.map((option) => {
            const selected = option.value === view
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onViewChange(option.value)}
                className={cn(
                  'relative min-h-10 rounded-lg px-4 font-display text-sm font-semibold transition-colors',
                  selected ? 'text-fg' : 'text-fg-muted hover:text-fg',
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
