import { CapacityBar } from '@/components/ui'
import { getCapacityTone } from '@/components/ui/capacity'
import { cn } from '@/lib/cn'

const MAX_PIPS = 12

interface SeatPipsProps {
  booked: number
  capacity: number
  /** Hex del tipo de clase: color de los cupos ocupados. */
  color: string
  /** Solo los puntos, sin el texto de cupos libres (celdas densas). */
  compact?: boolean
  className?: string
}

const textTone = { ok: 'text-fg-muted', warn: 'text-warn', danger: 'text-danger' } as const

/** Un punto por cupo: ocupados con el color del estilo, libres como aro. Se lee de un vistazo. */
export function SeatPips({ booked, capacity, color, compact = false, className }: SeatPipsProps) {
  if (capacity > MAX_PIPS) return <CapacityBar booked={booked} capacity={capacity} compact={compact} className={className} />

  const tone = getCapacityTone(booked, capacity)
  const left = Math.max(capacity - booked, 0)
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span role="img" aria-label={`${booked} de ${capacity} cupos`} className="flex items-center gap-1">
        {Array.from({ length: capacity }, (_, i) => (
          <span
            key={i}
            className={cn('size-2 rounded-full transition-colors', i >= booked && 'ring-1 ring-inset ring-line-strong')}
            style={i < booked ? { backgroundColor: color } : undefined}
          />
        ))}
      </span>
      {!compact && (
        <span aria-hidden className={cn('text-[11px] font-semibold tabular-nums', textTone[tone])}>
          {left === 0 ? 'Llena' : left === 1 ? '1 cupo' : `${left} cupos`}
        </span>
      )}
    </div>
  )
}
