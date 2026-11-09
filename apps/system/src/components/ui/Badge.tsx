import type { ComponentProps, CSSProperties } from 'react'
import { cn } from '@/lib/cn'

export type BadgeTone = 'neutral' | 'rosa' | 'dorado' | 'ok' | 'warn' | 'danger'

const tones: Record<BadgeTone, string> = {
  neutral: 'border-line-strong bg-surface-3 text-fg-muted',
  rosa: 'border-rosa/30 bg-rosa-soft text-rosa-hover',
  dorado: 'border-dorado/30 bg-dorado-soft text-dorado',
  ok: 'border-ok/30 bg-ok-soft text-ok',
  warn: 'border-warn/30 bg-warn-soft text-warn',
  danger: 'border-danger/30 bg-danger-soft text-danger',
}

interface BadgeProps extends ComponentProps<'span'> {
  tone?: BadgeTone
  /** Hex del tipo de clase: tiñe fondo y borde y aclara el texto para mantener contraste. */
  color?: string
}

export function Badge({ tone = 'neutral', color, className, style, ...props }: BadgeProps) {
  const customStyle: CSSProperties | undefined = color
    ? {
        backgroundColor: `color-mix(in srgb, ${color} 20%, transparent)`,
        borderColor: `color-mix(in srgb, ${color} 45%, transparent)`,
        color: `color-mix(in srgb, ${color} 45%, white)`,
      }
    : undefined
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        !color && tones[tone],
        className,
      )}
      style={{ ...customStyle, ...style }}
      {...props}
    />
  )
}
