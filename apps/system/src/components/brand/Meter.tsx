import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type MeterTone = 'rosa' | 'dorado' | 'ok' | 'warn' | 'danger'

interface MeterProps {
  value: number
  max: number
  tone?: MeterTone
  /** Texto accesible completo, ej. "8 de 12 cupos". */
  label: string
  /** `ring` (círculo, con hijos al centro) o `bar` (pista gruesa). */
  variant?: 'ring' | 'bar'
  /** Diámetro del anillo en px. */
  size?: number
  className?: string
  children?: ReactNode
}

const stroke: Record<MeterTone, string> = {
  rosa: 'var(--color-rosa-hover)',
  dorado: 'var(--color-dorado)',
  ok: 'var(--color-ok)',
  warn: 'var(--color-warn)',
  danger: 'var(--color-danger)',
}

const barFill: Record<MeterTone, string> = {
  rosa: 'bg-gradient-felinas',
  dorado: 'bg-dorado',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

/** Medidor de proporción: anillo con contenido central o pista gruesa. */
export function Meter({ value, max, tone = 'rosa', label, variant = 'ring', size = 56, className, children }: MeterProps) {
  const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  if (variant === 'bar') {
    return (
      <div
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn('h-2.5 w-full overflow-hidden rounded-full bg-surface-3', className)}
      >
        <div className={cn('h-full rounded-full transition-[width] duration-700', barFill[tone])} style={{ width: `${ratio * 100}%` }} />
      </div>
    )
  }
  const strokeWidth = Math.max(4, size / 10)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  return (
    <div
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('relative shrink-0', className)}
      style={{ width: size, height: size }}
    >
      <svg aria-hidden width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--color-surface-3)" strokeWidth={strokeWidth} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke[tone]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}
