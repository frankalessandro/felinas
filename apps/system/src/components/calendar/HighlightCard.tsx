import { Clock, MapPin, Sparkles } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Badge } from '@/components/ui'
import { cn } from '@/lib/cn'
import { describeHighlight } from './lib'
import type { CalendarHighlight } from './types'

interface HighlightCardProps {
  highlight: CalendarHighlight
  onClick?: (highlight: CalendarHighlight) => void
  className?: string
}

/** Evento de la academia (show, batalla, obra): tarjeta ámbar con estrella. */
export function HighlightCard({ highlight, onClick, className }: HighlightCardProps) {
  const content = (
    <>
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <h4 className="font-display text-base font-bold leading-tight">{highlight.title}</h4>
        {highlight.badge && <Badge tone="dorado">{highlight.badge}</Badge>}
      </div>
      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-fg-muted">
        {highlight.subtitle && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" aria-hidden />
            {highlight.subtitle}
          </span>
        )}
        <span className="inline-flex items-center gap-1">
          <Clock className="size-3.5" aria-hidden />
          {highlight.time ?? 'Horario por confirmar'}
        </span>
      </p>
    </>
  )

  return (
    <div className={cn('relative flex items-center gap-3 overflow-hidden rounded-2xl border border-ambar/30 bg-gradient-to-r from-ambar-soft to-surface p-3 shadow-card', className)}>
      <IconTile icon={Sparkles} tone="ambar" />
      {onClick ? (
        <button
          type="button"
          aria-label={describeHighlight(highlight)}
          onClick={() => onClick(highlight)}
          className="-m-1 flex min-h-11 min-w-0 flex-1 flex-col gap-1.5 rounded-lg p-1 text-left active:scale-[.99]"
        >
          {content}
        </button>
      ) : (
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">{content}</div>
      )}
    </div>
  )
}
