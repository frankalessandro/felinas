import { cn } from '@/lib/cn'

type BigNumberTone = 'rosa' | 'fg' | 'dorado' | 'ok' | 'warn' | 'danger'

interface BigNumberProps {
  value: string | number
  /** Unidad pequeña a la derecha, ej. "%" o "clases". */
  suffix?: string
  tone?: BigNumberTone
  /** @deprecated Se ignora: las cifras siempre van sólidas. */
  variant?: 'outline' | 'solid'
  className?: string
}

const toneClass: Record<BigNumberTone, string> = {
  rosa: 'text-rosa-hover',
  fg: 'text-fg',
  dorado: 'text-ambar',
  ok: 'text-ok',
  warn: 'text-warn',
  danger: 'text-danger',
}

/** Cifra protagonista de una tarjeta (clases restantes, total cobrado…). */
export function BigNumber({ value, suffix, tone = 'fg', className }: BigNumberProps) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 font-display font-bold leading-none tabular-nums', className)}>
      <span className={cn('text-[clamp(2rem,5vw,2.75rem)] tracking-tight', toneClass[tone])}>{value}</span>
      {suffix && <span className="text-sm font-medium text-fg-muted">{suffix}</span>}
    </span>
  )
}
