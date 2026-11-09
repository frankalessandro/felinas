import { Clock, Sparkles } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { cn } from '@/lib/cn'
import type { PlanAlert } from '../plans'

const toneStyles = {
  dorado: { box: 'border-ambar/30 bg-ambar-soft', title: 'text-ambar', tile: 'ambar' },
  danger: { box: 'border-danger/30 bg-danger-soft', title: 'text-danger', tile: 'danger' },
} as const

/** Aviso del plan (por vencer o con pocas clases). */
export function PlanAlertBanner({ alert }: { alert: PlanAlert }) {
  const Icon = alert.id.endsWith('-expiry') ? Clock : Sparkles
  const style = toneStyles[alert.tone]
  return (
    <div role="status" className={cn('flex items-center gap-4 rounded-2xl border p-4', style.box)}>
      <IconTile icon={Icon} tone={style.tile} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className={cn('font-display text-sm font-bold', style.title)}>{alert.title}</p>
        <p className="text-sm text-fg-muted">{alert.description}</p>
      </div>
    </div>
  )
}
