import { cn } from '@/lib/cn'

export type ProgressTone = 'rosa' | 'ok' | 'warn' | 'danger'

const fillTone: Record<ProgressTone, string> = {
  rosa: 'bg-gradient-felinas',
  ok: 'bg-ok',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

interface ProgressBarProps {
  value: number
  max?: number
  label: string
  tone?: ProgressTone
  className?: string
}

export function ProgressBar({ value, max = 100, label, tone = 'rosa', className }: ProgressBarProps) {
  const percent = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      className={cn('h-2 w-full overflow-hidden rounded-full bg-surface-3', className)}
    >
      <div className={cn('h-full rounded-full transition-[width] duration-500', fillTone[tone])} style={{ width: `${percent}%` }} />
    </div>
  )
}
