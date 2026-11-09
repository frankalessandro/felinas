import type { ComponentType } from 'react'
import { Ban, Check, Hourglass, Info, Lock, Sparkles } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { CalendarBadgeTone } from './types'

const TONE: Record<CalendarBadgeTone, { text: string; icon: ComponentType<{ className?: string }> }> = {
  ok: { text: 'text-ok', icon: Check },
  warn: { text: 'text-warn', icon: Hourglass },
  danger: { text: 'text-danger', icon: Ban },
  rosa: { text: 'text-rosa-hover', icon: Sparkles },
  dorado: { text: 'text-ambar', icon: Sparkles },
  neutral: { text: 'text-fg-muted', icon: Info },
}

interface EventStatusProps {
  label: string
  tone: CalendarBadgeTone
  /** Clase fuera del plan o sin acceso: candado en vez del icono del tono. */
  locked?: boolean
  className?: string
}

/** Estado de una clase como texto con icono, sin píldora: no compite con el título. */
export function EventStatus({ label, tone, locked = false, className }: EventStatusProps) {
  const { text, icon: Icon } = TONE[tone]
  const Glyph = locked ? Lock : Icon
  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] font-semibold leading-none', text, className)}>
      <Glyph className="size-3 shrink-0" aria-hidden />
      {label}
    </span>
  )
}
