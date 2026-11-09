import { cn } from '@/lib/cn'
import type { MonthKey } from '../months'
import { BUCKET_META } from '../rowMeta'
import type { SubscriptionRow } from '../types'
import { RowActions } from './RowActions'
import type { RowHandlers } from './RowActions'
import { ExpiryCell, MoneyCell, PlanCell, StatusBadges, StudentCell } from './RowParts'

interface SubscriptionTableProps {
  rows: SubscriptionRow[]
  month: MonthKey
  handlers: RowHandlers
}

const HEADERS = ['Alumna', 'Plan y clases', 'Vence', 'Estado', 'Pago', '']

/** Vista de escritorio: tabla densa para revisar muchas alumnas de una pasada. */
export function SubscriptionTable({ rows, month, handlers }: SubscriptionTableProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface/80 shadow-card">
      <table className="w-full min-w-[60rem] border-collapse text-left">
        <caption className="sr-only">Membresías de las alumnas del mes</caption>
        <thead>
          <tr className="border-b border-line bg-surface-2/50">
            {HEADERS.map((header, index) => (
              <th key={header || index} scope="col" className="px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                {header || <span className="sr-only">Acciones</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map((row) => (
            <tr key={row.studentId} className={cn('border-l-[3px] align-middle transition-colors hover:bg-surface-2/60', BUCKET_META[row.bucket].accent)}>
              <td className="px-4 py-3">
                <StudentCell row={row} />
              </td>
              <td className="w-56 px-4 py-3">
                <PlanCell row={row} />
              </td>
              <td className="px-4 py-3">
                <ExpiryCell row={row} />
              </td>
              <td className="px-4 py-3">
                <StatusBadges row={row} />
              </td>
              <td className="px-4 py-3">
                <MoneyCell row={row} />
              </td>
              <td className="px-4 py-3">
                <RowActions row={row} month={month} handlers={handlers} className="flex items-center justify-end gap-2" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
