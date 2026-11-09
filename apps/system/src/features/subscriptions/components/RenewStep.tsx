import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { AsyncContent, Avatar, Button, Checkbox, EmptyState } from '@/components/ui'
import { useRenewPlansBulk } from '../hooks/useSubscriptionMutations'
import { monthLabel, shiftMonth } from '../months'
import type { MonthKey } from '../months'
import { subscriptionsOverviewQuery } from '../queries'
import type { SubscriptionRow } from '../types'

type Candidate = SubscriptionRow & { studentPlanId: string }

function hasPlan(row: SubscriptionRow): row is Candidate {
  return row.studentPlanId !== null
}

interface RenewStepProps {
  month: MonthKey
  /** Planes que Mae desmarcó (por defecto se renuevan todos). */
  deselected: ReadonlySet<string>
  onToggle: (studentPlanId: string, selected: boolean) => void
  onToggleAll: (studentPlanIds: string[], selected: boolean) => void
  onRenewed: (count: number, studentIds: string[]) => void
  onSkip: () => void
}

/** Paso 1: renovar en bloque los planes del mes anterior. */
export function RenewStep({ month, deselected, onToggle, onToggleAll, onRenewed, onSkip }: RenewStepProps) {
  const previousMonth = shiftMonth(month, -1)
  const source = useQuery(subscriptionsOverviewQuery(previousMonth))
  const target = useQuery(subscriptionsOverviewQuery(month))
  const renew = useRenewPlansBulk()

  const alreadyHavePlan = new Set(target.data?.filter(hasPlan).map((row) => row.studentId))
  const candidates = source.data?.filter(hasPlan) ?? []
  const eligible = candidates.filter((row) => !alreadyHavePlan.has(row.studentId))
  const chosen = eligible.filter((row) => !deselected.has(row.studentPlanId))
  const allSelected = chosen.length === eligible.length

  function submit() {
    renew
      .mutateAsync({ studentPlanIds: chosen.map((row) => row.studentPlanId), month })
      .then((count) => onRenewed(count, chosen.map((row) => row.studentId)), () => undefined)
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Estos son los planes de {monthLabel(previousMonth)}. Deja marcadas las alumnas que continúan en {monthLabel(month)}; se les crea el mismo plan
        con vencimiento a fin de mes.
      </p>

      <AsyncContent
        isLoading={source.isLoading || target.isLoading}
        error={source.error ?? target.error}
        isEmpty={eligible.length === 0}
        onRetry={() => {
          void source.refetch()
          void target.refetch()
        }}
        empty={
          <EmptyState
            illustration="success"
            title="No hay planes por renovar"
            description={
              candidates.length > 0
                ? `Todas las alumnas de ${monthLabel(previousMonth)} ya tienen plan en ${monthLabel(month)}.`
                : `No hubo planes en ${monthLabel(previousMonth)}.`
            }
          />
        }
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <Checkbox
              label={<span className="font-semibold">Seleccionar todas</span>}
              checked={allSelected}
              onChange={(e) =>
                onToggleAll(
                  eligible.map((row) => row.studentPlanId),
                  e.target.checked,
                )
              }
            />
            <span className="text-sm text-fg-muted">
              {chosen.length} de {eligible.length}
            </span>
          </div>
          <ul className="flex max-h-[42dvh] flex-col divide-y divide-line overflow-y-auto rounded-xl border border-line bg-surface-2 px-3">
            {eligible.map((row) => (
              <li key={row.studentPlanId} className="flex items-center gap-2">
                <Checkbox
                  aria-label={`Renovar a ${row.fullName}`}
                  label=""
                  className="w-auto shrink-0"
                  checked={!deselected.has(row.studentPlanId)}
                  onChange={(e) => onToggle(row.studentPlanId, e.target.checked)}
                />
                <Avatar name={row.fullName} src={row.avatarUrl} size="sm" />
                <div className="flex min-w-0 flex-1 flex-col py-2">
                  <span className="truncate text-sm font-semibold">{row.fullName}</span>
                  <span className="truncate text-xs text-fg-muted">{row.planName}</span>
                </div>
              </li>
            ))}
          </ul>
          <p className="text-xs text-fg-muted">Se renuevan al precio actual de cada plan. Si alguna tenía descuento, ajústalo después desde su ficha.</p>
        </div>
      </AsyncContent>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={onSkip}>
          {eligible.length === 0 ? 'Siguiente' : 'Saltar este paso'}
        </Button>
        {eligible.length > 0 && (
          <Button loading={renew.isPending} disabled={chosen.length === 0} onClick={submit}>
            <RefreshCw className="size-4" aria-hidden /> Renovar {chosen.length} {chosen.length === 1 ? 'plan' : 'planes'}
          </Button>
        )}
      </div>
    </div>
  )
}
