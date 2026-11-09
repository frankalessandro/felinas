import { useQuery } from '@tanstack/react-query'
import { HandCoins, RefreshCw, UsersRound, Wallet } from 'lucide-react'
import { IconTile, Meter } from '@/components/brand'
import { StatCard } from '@/components/ui'
import { formatCOP } from '@/lib/money'
import type { MonthKey } from '../months'
import { monthRevenueQuery, outstandingBalanceQuery } from '../queries'
import type { SubscriptionRow } from '../types'

interface SummaryStripProps {
  month: MonthKey
  rows: SubscriptionRow[] | undefined
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`
}

/** Resumen del mes en cuatro tarjetas: cobrado, por cobrar, cobertura de planes y renovaciones pendientes. */
export function SummaryStrip({ rows, month }: SummaryStripProps) {
  const revenue = useQuery(monthRevenueQuery(month))
  const outstanding = useQuery(outstandingBalanceQuery())

  const withPlan = rows?.filter((row) => row.studentPlanId !== null).length ?? 0
  const toRenew = rows?.filter((row) => row.bucket === 'expired_not_renewed' || row.bucket === 'expiring_soon').length ?? 0
  const owes = (outstanding.data?.total ?? 0) > 0

  return (
    <section aria-label="Resumen del mes" className="grid grid-cols-1 gap-4 min-[480px]:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label="Cobrado del mes"
        icon={Wallet}
        tone="dorado"
        value={revenue.data ? formatCOP(revenue.data.total) : '—'}
        hint={revenue.data ? plural(revenue.data.count, 'pago registrado', 'pagos registrados') : revenue.isError ? 'No se pudo cargar' : 'Cargando…'}
      />
      <StatCard
        label="Por cobrar"
        icon={HandCoins}
        tone={owes ? 'warn' : 'default'}
        value={outstanding.data ? formatCOP(outstanding.data.total) : '—'}
        hint={outstanding.data ? `${plural(outstanding.data.students, 'alumna', 'alumnas')} con saldo` : outstanding.isError ? 'No se pudo cargar' : 'Cargando…'}
      />
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-surface p-5 shadow-card">
        <div className="flex items-center gap-3">
          <IconTile icon={UsersRound} tone="ok" size="sm" />
          <p className="text-sm font-medium text-fg-muted">Con plan</p>
        </div>
        <p className="font-display text-[1.875rem] font-bold leading-none tracking-tight tabular-nums">
          {rows ? withPlan : '—'}
          {rows && <span className="ml-1.5 text-sm font-medium text-fg-muted">de {rows.length}</span>}
        </p>
        <Meter variant="bar" tone="ok" value={withPlan} max={Math.max(rows?.length ?? 0, 1)} label={`${withPlan} de ${rows?.length ?? 0} alumnas con plan`} />
      </div>
      <StatCard label="Por renovar" icon={RefreshCw} tone={toRenew > 0 ? 'rosa' : 'default'} value={rows ? toRenew : '—'} hint="Vencidas o por vencer" />
    </section>
  )
}
