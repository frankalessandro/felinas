import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button, IconButton } from '@/components/ui'
import { currentMonthKey, monthLabel, shiftMonth } from '../months'
import type { MonthKey } from '../months'

interface MonthNavigatorProps {
  month: MonthKey
  onChange: (month: MonthKey) => void
}

export function MonthNavigator({ month, onChange }: MonthNavigatorProps) {
  const isCurrent = month === currentMonthKey()
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-surface p-1">
      <IconButton aria-label="Mes anterior" className="size-10 rounded-lg" onClick={() => onChange(shiftMonth(month, -1))}>
        <ChevronLeft className="size-5" aria-hidden />
      </IconButton>
      <p aria-live="polite" className="min-w-32 text-center font-display text-sm font-bold">
        {monthLabel(month)}
      </p>
      <IconButton aria-label="Mes siguiente" className="size-10 rounded-lg" onClick={() => onChange(shiftMonth(month, 1))}>
        <ChevronRight className="size-5" aria-hidden />
      </IconButton>
      {!isCurrent && (
        <Button variant="ghost" size="sm" className="min-h-10" onClick={() => onChange(currentMonthKey())}>
          Hoy
        </Button>
      )}
    </div>
  )
}
