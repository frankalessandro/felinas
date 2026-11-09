import { useQueries, useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CreditCard, HandCoins, Layers, Receipt, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile } from '@/components/brand'
import { BarList, ColumnChart, DonutChart } from '@/components/charts'
import type { BarListItem, ColumnDatum, DonutSegment } from '@/components/charts'
import { AsyncContent, Avatar, EmptyState, Skeleton } from '@/components/ui'
import { getMethodLabel } from '@/features/payments/constants'
import { PaymentMethodChip } from '@/features/payments/components/PaymentMethodChip'
import { recentPaymentsQuery } from '@/features/payments/queries'
import { cn } from '@/lib/cn'
import { formatters, fromDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import { monthEnd, monthLabel, monthStart, shiftMonth } from '../months'
import type { MonthKey } from '../months'
import { monthRevenueQuery, outstandingBalanceQuery } from '../queries'
import type { RevenueSlice } from '../types'

const PANEL = 'rounded-2xl border border-line bg-surface/80 p-5 shadow-card'
const TREND_MONTHS = 6
const PERCENT = 100
const SHORT_MONTH_LENGTH = 3
/** Colores de categoría para la dona; siempre acompañados de leyenda con texto. */
const DONUT_COLORS = ['var(--color-ambar)', 'var(--color-rosa)', 'var(--color-violeta)', 'var(--color-cian)', 'var(--color-ok)', 'var(--color-warn)']

function shortMonth(month: MonthKey): string {
  return (formatters.monthYear(fromDateKey(monthStart(month))).split(' ')[0] ?? '').slice(0, SHORT_MONTH_LENGTH)
}

function DeltaChip({ total, previous, previousLabel }: { total: number; previous: number; previousLabel: string }) {
  if (previous <= 0) {
    return <p className="text-sm text-fg-muted">{total > 0 ? `Sin ingresos en ${previousLabel} para comparar.` : 'Aún no hay ingresos.'}</p>
  }
  const change = Math.round(((total - previous) / previous) * PERCENT)
  const up = change >= 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-sm font-semibold', up ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger')}>
        <Icon className="size-4" aria-hidden />
        {up ? '+' : ''}
        {change}%
      </span>
      <span className="text-sm text-fg-muted">
        vs. {previousLabel} ({formatCOP(previous)})
      </span>
    </div>
  )
}

interface SlicePanelProps {
  title: string
  description: string
  icon: LucideIcon
  children: ReactNode
  className?: string
}

function SlicePanel({ title, description, icon, children, className }: SlicePanelProps) {
  return (
    <section className={cn(PANEL, className)} aria-label={title}>
      <header className="mb-5 flex items-center gap-3">
        <IconTile icon={icon} tone="ambar" size="sm" />
        <div>
          <h3 className="font-display text-base font-bold leading-tight">{title}</h3>
          <p className="text-xs text-fg-muted">{description}</p>
        </div>
      </header>
      {children}
    </section>
  )
}

function toBarItems(slices: RevenueSlice[]): BarListItem[] {
  return slices.map((slice) => ({
    key: slice.key,
    label: `${slice.label} · ${slice.count} ${slice.count === 1 ? 'pago' : 'pagos'}`,
    value: slice.amount,
    display: formatCOP(slice.amount),
    color: 'var(--color-ambar)',
  }))
}

function toDonutSegments(slices: RevenueSlice[]): DonutSegment[] {
  return slices.map((slice, index) => ({
    key: slice.key,
    label: slice.label,
    value: slice.amount,
    color: DONUT_COLORS[index % DONUT_COLORS.length] ?? 'var(--color-ambar)',
  }))
}

export function IncomePanel({ month }: { month: MonthKey }) {
  const previousMonth = shiftMonth(month, -1)
  const revenue = useQuery(monthRevenueQuery(month))
  const previous = useQuery(monthRevenueQuery(previousMonth))
  const outstanding = useQuery(outstandingBalanceQuery())
  const recent = useQuery(recentPaymentsQuery(monthStart(month), monthEnd(month)))

  const trendMonths = Array.from({ length: TREND_MONTHS }, (_, index) => shiftMonth(month, index - (TREND_MONTHS - 1)))
  const trend = useQueries({ queries: trendMonths.map((key) => monthRevenueQuery(key)) })
  const trendReady = trend.every((query) => query.data !== undefined)
  const trendData: ColumnDatum[] = trendMonths.map((key, index) => {
    const total = trend[index]?.data?.total ?? 0
    return { key, label: shortMonth(key), value: total, display: formatCOP(total), highlight: key === month }
  })

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 lg:grid-cols-12">
        <section className={cn(PANEL, 'flex flex-col gap-5 lg:col-span-8')} aria-label={`Ingresos de ${monthLabel(month)}`}>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <IconTile icon={Wallet} tone="ambar" size="sm" />
              <p className="text-sm font-medium text-fg-muted">Ingresos de {monthLabel(month)}</p>
            </div>
            {revenue.isLoading ? (
              <Skeleton className="h-10 w-56" />
            ) : revenue.error ? (
              <p role="alert" className="text-sm text-danger">
                {revenue.error.message}
              </p>
            ) : (
              <p className="font-display text-4xl font-bold leading-none tracking-tight tabular-nums text-ambar sm:text-5xl">{formatCOP(revenue.data?.total ?? 0)}</p>
            )}
            {revenue.data && previous.data && (
              <DeltaChip total={revenue.data.total} previous={previous.data.total} previousLabel={monthLabel(previousMonth)} />
            )}
          </div>
          {trendReady ? (
            <ColumnChart data={trendData} color="var(--color-ambar)" height={140} label={`Ingresos de los últimos ${TREND_MONTHS} meses`} />
          ) : (
            <Skeleton className="h-40" />
          )}
        </section>
        <section className={cn(PANEL, 'flex flex-col gap-3 lg:col-span-4')} aria-label="Por cobrar">
          <div className="flex items-center gap-3">
            <IconTile icon={HandCoins} tone={(outstanding.data?.total ?? 0) > 0 ? 'warn' : 'neutral'} size="sm" />
            <p className="text-sm font-medium text-fg-muted">Por cobrar · todos los planes</p>
          </div>
          {outstanding.isLoading ? (
            <Skeleton className="h-10 w-40" />
          ) : (
            <p className={cn('font-display text-3xl font-bold leading-none tracking-tight tabular-nums', (outstanding.data?.total ?? 0) > 0 && 'text-warn')}>
              {formatCOP(outstanding.data?.total ?? 0)}
            </p>
          )}
          {outstanding.data && (
            <p className="text-sm text-fg-muted">
              {outstanding.data.students} {outstanding.data.students === 1 ? 'alumna' : 'alumnas'} con saldo pendiente
            </p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SlicePanel title="Por método de pago" description="¿Cómo pagan?" icon={CreditCard}>
          <AsyncContent
            isLoading={revenue.isLoading}
            error={revenue.error}
            isEmpty={(revenue.data?.byMethod.length ?? 0) === 0}
            onRetry={() => revenue.refetch()}
            empty={<EmptyState illustration="wallet" title="Sin pagos este mes" className="py-6" />}
          >
            {revenue.data && (
              <DonutChart segments={toDonutSegments(revenue.data.byMethod)} label={`Ingresos de ${monthLabel(month)} por método de pago`}>
                <div>
                  <p className="font-display text-sm font-bold tabular-nums">{formatCOP(revenue.data.total)}</p>
                  <p className="text-[11px] text-fg-subtle">Total</p>
                </div>
              </DonutChart>
            )}
          </AsyncContent>
        </SlicePanel>
        <SlicePanel title="Por plan" description="¿Qué compran?" icon={Layers}>
          <AsyncContent
            isLoading={revenue.isLoading}
            error={revenue.error}
            isEmpty={(revenue.data?.byPlan.length ?? 0) === 0}
            onRetry={() => revenue.refetch()}
            empty={<EmptyState illustration="chart" title="Sin pagos este mes" className="py-6" />}
          >
            {revenue.data && <BarList items={toBarItems(revenue.data.byPlan)} />}
          </AsyncContent>
        </SlicePanel>
      </div>

      <SlicePanel title="Pagos recientes" description="Libro de caja del mes" icon={Receipt}>
        <AsyncContent
          isLoading={recent.isLoading}
          error={recent.error}
          isEmpty={(recent.data?.length ?? 0) === 0}
          onRetry={() => recent.refetch()}
          empty={<EmptyState illustration="wallet" title="Sin pagos este mes" description="Cuando registres un pago aparecerá aquí." className="py-6" />}
        >
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Pagos registrados en {monthLabel(month)}</caption>
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Alumna
                  </th>
                  <th scope="col" className="hidden py-2 pr-3 font-semibold sm:table-cell">
                    Fecha
                  </th>
                  <th scope="col" className="hidden py-2 pr-3 font-semibold sm:table-cell">
                    Método
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {recent.data?.map((payment) => {
                  const name = payment.student?.full_name ?? 'Alumna'
                  const voided = payment.voided_at !== null
                  const date = formatters.shortDate(fromDateKey(payment.paid_on))
                  return (
                    <tr key={payment.id}>
                      <td className="py-3 pr-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={name} src={payment.student?.avatar_url} size="md" />
                          <div className="flex min-w-0 flex-col">
                            <Link
                              to="/admin/students/$studentId"
                              params={{ studentId: payment.student_id }}
                              search={{ tab: 'plans' }}
                              className="truncate text-sm font-semibold hover:text-rosa-hover"
                            >
                              {name}
                            </Link>
                            <span className="text-xs text-fg-muted sm:hidden">
                              {date} · {getMethodLabel(payment.method)}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="hidden py-3 pr-3 text-sm text-fg-muted sm:table-cell">{date}</td>
                      <td className="hidden py-3 pr-3 sm:table-cell">
                        <PaymentMethodChip method={payment.method} />
                      </td>
                      <td className="py-3 text-right">
                        <span className={cn('font-display text-sm font-bold tabular-nums text-ambar', voided && 'text-fg-subtle line-through')}>
                          {formatCOP(payment.amount)}
                        </span>
                        {voided && <span className="block text-[11px] font-semibold text-danger">Anulado</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </AsyncContent>
      </SlicePanel>
    </div>
  )
}
