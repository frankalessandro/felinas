import { useQuery } from '@tanstack/react-query'
import { ChartNoAxesColumn, Layers, Repeat2 } from 'lucide-react'
import { IconTile, Meter, Stamp } from '@/components/brand'
import { AsyncContent, EmptyState } from '@/components/ui'
import { cn } from '@/lib/cn'
import { DEFAULT_RENEWAL_MONTHS } from '../api/reports.api'
import { renewalReportQuery } from '../queries'
import { getHeadline, getMonthPoints, getPlanHighlights, getPlanRows } from '../renewal'
import { RenewalTrendChart } from './RenewalTrendChart'
import { ReportPanel } from './ReportPanel'

function DeltaChip({ deltaPts }: { deltaPts: number | null }) {
  if (deltaPts === null || deltaPts === 0) return null
  const up = deltaPts > 0
  return (
    <span className={cn('w-fit rounded-full px-2.5 py-1 text-xs font-semibold', up ? 'bg-ok-soft text-ok' : 'bg-danger-soft text-danger')}>
      {up ? '+' : ''}
      {deltaPts} pts vs. mes anterior
    </span>
  )
}

export function RenewalSection() {
  const query = useQuery(renewalReportQuery(DEFAULT_RENEWAL_MONTHS))
  const rows = query.data ?? []
  const points = getMonthPoints(rows, DEFAULT_RENEWAL_MONTHS)
  const headline = getHeadline(points)
  const plans = getPlanRows(rows)
  const highlights = getPlanHighlights(plans)

  return (
    <AsyncContent
      isLoading={query.isLoading}
      error={query.error}
      onRetry={() => void query.refetch()}
      isEmpty={headline.ended === 0}
      empty={
        <EmptyState
          illustration="chart"
          title="Aún no hay renovaciones que medir"
          description="Aparecerán cuando termine el primer mes completo con planes asignados."
        />
      }
    >
      <div className="flex flex-col gap-4">
        <div className="grid gap-4 lg:grid-cols-12">
          <section aria-label="Tasa de renovación" className="flex flex-col justify-between gap-5 rounded-2xl border border-line bg-surface/80 p-5 shadow-card lg:col-span-5">
            <div className="flex items-center gap-3">
              <IconTile icon={Repeat2} tone="rosa" size="sm" />
              <p className="text-sm font-medium text-fg-muted">Renovación · últimos {DEFAULT_RENEWAL_MONTHS} meses</p>
            </div>
            <div className="flex items-center gap-5">
              <Meter
                value={headline.ratePct ?? 0}
                max={100}
                size={96}
                label={headline.ratePct === null ? 'Sin tasa de renovación' : `${headline.ratePct}% de renovación`}
              >
                <span className="font-display text-xl font-bold tabular-nums">{headline.ratePct === null ? '—' : `${headline.ratePct}%`}</span>
              </Meter>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-fg-muted">
                  <span className="font-display text-lg font-bold tabular-nums text-fg">{headline.renewed}</span> de{' '}
                  <span className="font-display text-lg font-bold tabular-nums text-fg">{headline.ended}</span> planes se renovaron al mes siguiente
                </p>
                <DeltaChip deltaPts={headline.deltaPts} />
              </div>
            </div>
          </section>
          <ReportPanel
            title="Tendencia mensual"
            description="Alumnas cuyo plan empezó ese mes y que tuvieron otro plan el mes siguiente."
            icon={ChartNoAxesColumn}
            className="lg:col-span-7"
          >
            <RenewalTrendChart points={points} />
          </ReportPanel>
        </div>

        <ReportPanel
          title="Renovación por plan"
          description={highlights ? 'Destacamos el mejor y el peor plan (con al menos 3 planes terminados).' : 'Cuántas alumnas siguen con cada plan.'}
          icon={Layers}
          tone="violeta"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] border-collapse text-left">
              <caption className="sr-only">Tasa de renovación por plan</caption>
              <thead>
                <tr className="border-b border-line text-[11px] font-semibold uppercase tracking-[0.12em] text-fg-subtle">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Plan
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Terminaron
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Renovaron
                  </th>
                  <th scope="col" className="w-2/5 py-2 font-semibold">
                    Tasa
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {plans.map((plan) => {
                  const best = highlights?.bestId === plan.id
                  const worst = highlights?.worstId === plan.id
                  return (
                    <tr key={plan.id}>
                      <td className="py-3 pr-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold">{plan.label}</span>
                          {best && <Stamp tone="ok">Mejor</Stamp>}
                          {worst && <Stamp tone="danger">A mejorar</Stamp>}
                        </div>
                      </td>
                      <td className="py-3 pr-3 text-right text-sm tabular-nums text-fg-muted">{plan.ended}</td>
                      <td className="py-3 pr-3 text-right text-sm tabular-nums text-fg-muted">{plan.renewed}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <Meter
                            variant="bar"
                            value={plan.ratePct}
                            max={100}
                            tone={best ? 'ok' : worst ? 'danger' : 'rosa'}
                            label={`${plan.label}: ${plan.ratePct}% de renovación, ${plan.renewed} renovaron de ${plan.ended}`}
                          />
                          <span className="w-12 shrink-0 text-right font-display text-sm font-bold tabular-nums">{plan.ratePct}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </ReportPanel>
      </div>
    </AsyncContent>
  )
}
