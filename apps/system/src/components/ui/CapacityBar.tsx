import { cn } from '@/lib/cn'
import { getCapacityTone } from './capacity'
import { ProgressBar } from './ProgressBar'

const textTone = { ok: 'text-ok', warn: 'text-warn', danger: 'text-danger' } as const

interface CapacityBarProps {
  booked: number
  capacity: number
  /** Oculta el texto "8/12" (la barra sigue siendo accesible). */
  compact?: boolean
  className?: string
}

export function CapacityBar({ booked, capacity, compact = false, className }: CapacityBarProps) {
  const tone = getCapacityTone(booked, capacity)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <ProgressBar value={booked} max={capacity} tone={tone} label={`${booked} de ${capacity} cupos`} className="h-1.5 flex-1" />
      {!compact && (
        <span aria-hidden className={cn('text-xs font-bold tabular-nums', textTone[tone])}>
          {booked}/{capacity}
        </span>
      )}
    </div>
  )
}
