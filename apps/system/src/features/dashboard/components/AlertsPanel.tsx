import { useQuery } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { AtRiskList } from '@/features/reports/components/AtRiskList'
import { atRiskStudentsQuery } from '@/features/reports/queries'
import { cn } from '@/lib/cn'
import { expiringPlansQuery } from '../queries'
import { ExpiringPlansList } from './ExpiringPlansList'

const PREVIEW_LIMIT = 4

function CountBadge({ count, tone }: { count: number | undefined; tone: 'danger' | 'warn' }) {
  if (count === undefined) return null
  return (
    <span
      className={cn(
        'ml-2 inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[11px] font-bold tabular-nums',
        count === 0 ? 'bg-surface-3 text-fg-muted' : tone === 'danger' ? 'bg-danger-soft text-danger' : 'bg-warn-soft text-warn',
      )}
    >
      {count}
    </span>
  )
}

/** A quién escribirle hoy: alumnas inactivas y planes a punto de terminar, en pestañas. */
export function AlertsPanel() {
  const atRisk = useQuery(atRiskStudentsQuery())
  const expiring = useQuery(expiringPlansQuery())

  return (
    <section aria-labelledby="alerts-title" className="rounded-2xl border border-line bg-surface/80 p-5 shadow-card">
      <header className="mb-3 flex items-center gap-3">
        <IconTile icon={BellRing} tone="warn" />
        <div>
          <h2 id="alerts-title" className="font-display text-base font-bold leading-tight">
            Escríbeles hoy
          </h2>
          <p className="text-xs text-fg-muted">Un mensaje a tiempo las trae de vuelta.</p>
        </div>
      </header>
      <Tabs defaultValue="risk">
        <TabsList>
          <TabsTrigger value="risk">
            En riesgo
            <CountBadge count={atRisk.data?.length} tone="danger" />
          </TabsTrigger>
          <TabsTrigger value="expiring">
            Por vencer
            <CountBadge count={expiring.data?.length} tone="warn" />
          </TabsTrigger>
        </TabsList>
        <TabsContent value="risk">
          <AtRiskList
            students={atRisk.data}
            isLoading={atRisk.isLoading}
            error={atRisk.error}
            onRetry={() => void atRisk.refetch()}
            limit={PREVIEW_LIMIT}
          />
        </TabsContent>
        <TabsContent value="expiring">
          <ExpiringPlansList plans={expiring.data} isLoading={expiring.isLoading} error={expiring.error} onRetry={() => void expiring.refetch()} />
        </TabsContent>
      </Tabs>
    </section>
  )
}
