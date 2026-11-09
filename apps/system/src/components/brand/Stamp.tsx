import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

export type StampTone = 'ok' | 'warn' | 'danger' | 'dorado' | 'rosa' | 'muted' | 'info'

interface StampProps {
  children: ReactNode
  tone?: StampTone
  /** Obsoleto: se mantiene por compatibilidad, ya no inclina el sello. */
  tilt?: boolean
  className?: string
}

const toneClass: Record<StampTone, { pill: string; dot: string }> = {
  ok: { pill: 'bg-ok-soft text-ok', dot: 'bg-ok' },
  warn: { pill: 'bg-warn-soft text-warn', dot: 'bg-warn' },
  danger: { pill: 'bg-danger-soft text-danger', dot: 'bg-danger' },
  dorado: { pill: 'bg-ambar-soft text-ambar', dot: 'bg-ambar' },
  rosa: { pill: 'bg-rosa-soft text-rosa-hover', dot: 'bg-rosa-hover' },
  muted: { pill: 'bg-surface-3 text-fg-muted', dot: 'bg-fg-subtle' },
  info: { pill: 'bg-cian-soft text-cian', dot: 'bg-cian' },
}

/** Etiqueta de estado con punto de color ("Pagado", "Abono", "Congelado"). */
export function Stamp({ children, tone = 'muted', className }: StampProps) {
  const styles = toneClass[tone]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none',
        styles.pill,
        className,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', styles.dot)} />
      {children}
    </span>
  )
}
