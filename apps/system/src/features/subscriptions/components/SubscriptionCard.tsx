import { cn } from '@/lib/cn'
import type { MonthKey } from '../months'
import { BUCKET_META } from '../rowMeta'
import type { SubscriptionRow } from '../types'
import { RowActions } from './RowActions'
import type { RowHandlers } from './RowActions'
import { ExpiryCell, MoneyCell, PlanCell, StatusBadges, StudentCell } from './RowParts'

interface SubscriptionCardProps {
  row: SubscriptionRow
  month: MonthKey
  handlers: RowHandlers
}

const LABEL_CLASS = 'text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle'

/** Vista móvil: una tarjeta por alumna con la situación en el borde y la acción principal al pie. */
export function SubscriptionCard({ row, month, handlers }: SubscriptionCardProps) {
  return (
    <article className={cn('flex flex-col gap-3.5 rounded-2xl border border-l-[3px] border-line bg-surface/80 p-4 shadow-card', BUCKET_META[row.bucket].accent)}>
      <div className="flex items-start justify-between gap-3">
        <StudentCell row={row} />
        <StatusBadges row={row} />
      </div>
      <PlanCell row={row} />
      <div className="grid grid-cols-2 gap-3 border-t border-line pt-3">
        <div className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Vence</span>
          <ExpiryCell row={row} />
        </div>
        <div className="flex flex-col gap-1">
          <span className={LABEL_CLASS}>Pago</span>
          <MoneyCell row={row} />
        </div>
      </div>
      <RowActions row={row} month={month} handlers={handlers} className="flex w-full items-center gap-2" />
    </article>
  )
}
