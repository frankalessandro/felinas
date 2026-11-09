import { useQuery } from '@tanstack/react-query'
import { PartyPopper } from 'lucide-react'
import { BigNumber } from '@/components/brand'
import { AsyncContent, Avatar, Button } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { formatCOPOr } from '@/lib/money'
import { monthLabel } from '../months'
import type { MonthKey } from '../months'
import { subscriptionsOverviewQuery } from '../queries'
import { buildRenewedMessage } from '../reminders'

interface SummaryStepProps {
  month: MonthKey
  renewed: number | null
  created: number | null
  renewedStudentIds: string[]
  onFinish: () => void
}

/** Paso 3: resumen del día 1 y avisos por WhatsApp, una alumna a la vez (WhatsApp no permite abrir varios chats juntos). */
export function SummaryStep({ month, renewed, created, renewedStudentIds, onFinish }: SummaryStepProps) {
  const target = useQuery(subscriptionsOverviewQuery(month))
  const ids = new Set(renewedStudentIds)
  const rows = target.data?.filter((row) => ids.has(row.studentId) && row.studentPlanId !== null) ?? []

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1 rounded-2xl border border-ok/30 bg-ok-soft p-4">
          <BigNumber value={renewed ?? '—'} tone="ok" />
          <p className="text-xs text-fg-muted">{renewed === null ? 'Renovación omitida' : renewed === 1 ? 'plan renovado' : 'planes renovados'}</p>
        </div>
        <div className="flex flex-col gap-1 rounded-2xl border border-ok/30 bg-ok-soft p-4">
          <BigNumber value={created ?? '—'} tone="ok" />
          <p className="text-xs text-fg-muted">{created === null ? 'Clases omitidas' : created === 1 ? 'clase creada' : 'clases creadas'}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="font-display text-sm font-bold">Avisar a las alumnas</h3>
        <AsyncContent
          isLoading={target.isLoading}
          error={target.error}
          isEmpty={rows.length === 0}
          onRetry={() => target.refetch()}
          empty={<p className="text-sm text-fg-subtle">No hay renovaciones de este paso para avisar.</p>}
        >
          <ul className="flex max-h-[38dvh] flex-col divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface-2 px-3">
            {rows.map((row) => (
              <li key={row.studentId} className="flex items-center gap-3 py-2">
                <Avatar name={row.fullName} src={row.avatarUrl} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold">{row.fullName}</span>
                  <span className="truncate text-xs text-fg-muted">
                    {row.planName} · {formatCOPOr(row.price, 'sin valor')}
                  </span>
                </div>
                {row.phone ? (
                  <WhatsAppButton phone={row.phone} name={row.fullName} message={buildRenewedMessage(row, month)} size="sm" label="Avisar" />
                ) : (
                  <span className="text-xs text-fg-subtle">Sin celular</span>
                )}
              </li>
            ))}
          </ul>
        </AsyncContent>
        <p className="text-xs text-fg-muted">
          El mensaje avisa que el plan de {monthLabel(month)} ya está listo. Los pagos se registran desde cada alumna en el tablero.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={onFinish}>
          <PartyPopper className="size-4" aria-hidden /> Terminar y ver el tablero
        </Button>
      </div>
    </div>
  )
}
