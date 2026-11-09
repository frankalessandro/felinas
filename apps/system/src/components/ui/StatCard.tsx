import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile, type Tone } from '@/components/brand/IconTile'
import { cn } from '@/lib/cn'

type StatTone = 'default' | 'ok' | 'warn' | 'danger' | 'rosa' | 'dorado' | 'violeta' | 'cian'

const toneToTile: Record<StatTone, Tone> = {
  default: 'neutral',
  rosa: 'rosa',
  dorado: 'ambar',
  violeta: 'violeta',
  cian: 'cian',
  ok: 'ok',
  warn: 'warn',
  danger: 'danger',
}

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon?: LucideIcon
  tone?: StatTone
  /** Variación textual, ej. "+12% vs. mes pasado". */
  trend?: { label: string; tone: 'ok' | 'danger' | 'neutral' }
  /** Mini gráfica (ej. `<Sparkline />`) al pie de la tarjeta. */
  chart?: ReactNode
  /** @deprecated Se ignora: las cifras siempre van sólidas. */
  emphasis?: 'outline' | 'solid'
  className?: string
}

const trendStyle = {
  ok: 'bg-ok-soft text-ok',
  danger: 'bg-danger-soft text-danger',
  neutral: 'bg-surface-3 text-fg-muted',
} as const

export function StatCard({ label, value, hint, icon, tone = 'default', trend, chart, className }: StatCardProps) {
  return (
    <div
      className={cn(
        'group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition-colors hover:border-line-strong',
        className,
      )}
    >
      <div className="flex items-center gap-3">
        {icon && <IconTile icon={icon} tone={toneToTile[tone]} size="sm" />}
        <p className="text-sm font-medium text-fg-muted">{label}</p>
      </div>
      <div className="flex items-end justify-between gap-3">
        <p className="font-display text-[1.875rem] font-bold leading-none tracking-tight tabular-nums">{value}</p>
        {trend && (
          <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', trendStyle[trend.tone])}>{trend.label}</span>
        )}
      </div>
      {chart && <div className="-mx-1 h-10">{chart}</div>}
      {hint && <p className="text-xs text-fg-subtle">{hint}</p>}
    </div>
  )
}
