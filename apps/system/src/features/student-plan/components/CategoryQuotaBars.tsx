import { Layers } from 'lucide-react'
import { Meter } from '@/components/brand'
import type { QuotaUsage } from '@/features/bookings/quota'

/** Cuántas clases lleva la alumna de cada categoría de su combo (ej. Twerk 2/3 · Urbano 0/1). */
export function CategoryQuotaBars({ usage }: { usage: QuotaUsage[] }) {
  if (usage.length === 0) return null
  return (
    <div className="flex flex-col gap-3 border-t border-line pt-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-fg-muted">
        <Layers className="size-4" aria-hidden />
        Clases por categoría
      </p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {usage.map(({ quota, used }) => {
          const isFull = used >= quota.max
          return (
            <li key={quota.categoryId} className="flex flex-col gap-2 rounded-xl border border-line bg-surface-2/60 p-3">
              <div className="flex items-baseline justify-between gap-3">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: quota.color }} />
                  {quota.name}
                </span>
                <span className="font-display text-lg font-bold tabular-nums">
                  <span className={isFull ? 'text-warn' : 'text-fg'}>{used}</span>
                  <span className="text-sm font-medium text-fg-muted">/{quota.max}</span>
                </span>
              </div>
              <Meter variant="bar" value={used} max={quota.max} tone={isFull ? 'warn' : 'rosa'} label={`${quota.name}: ${used} de ${quota.max} clases usadas`} />
              {isFull && <p className="text-xs font-semibold text-warn">Categoría agotada</p>}
            </li>
          )
        })}
      </ul>
    </div>
  )
}
