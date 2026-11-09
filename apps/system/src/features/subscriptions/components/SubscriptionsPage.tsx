import { useQuery } from '@tanstack/react-query'
import { CalendarCheck, ChartNoAxesColumn, LayoutList, Search, Wallet } from 'lucide-react'
import { useState } from 'react'
import type { BadgeTone } from '@/components/ui'
import { cn } from '@/lib/cn'
import { AsyncContent, Button,EmptyState, Input, PageHeader, SegmentedControl, Skeleton, Tabs, TabsList, TabsTrigger } from '@/components/ui'
import { plansQuery } from '@/features/plans/queries'
import { RegisterPaymentDialog } from '@/features/payments/components/RegisterPaymentDialog'
import { AssignPlanDialog } from '@/features/students/components/AssignPlanDialog'
import { useMediaQuery } from '@/hooks/useMediaQuery'
import type { Tables } from '@/types/database'
import { useRenewPlan } from '../hooks/useSubscriptionMutations'
import { currentMonthKey, shiftMonth } from '../months'
import type { MonthKey } from '../months'
import { subscriptionsOverviewQuery } from '../queries'
import { BUCKET_META, getRenewSourceId } from '../rowMeta'
import { SUBSCRIPTION_BUCKETS } from '../types'
import type { SubscriptionBucket, SubscriptionRow } from '../types'
import { FreezePlanDialog } from './FreezePlanDialog'
import { IncomePanel } from './IncomePanel'
import { MonthNavigator } from './MonthNavigator'
import { OrganizeMonthDialog } from './OrganizeMonthDialog'
import { PostRenewDialog } from './PostRenewDialog'
import type { RowHandlers } from './RowActions'
import { SubscriptionCard } from './SubscriptionCard'
import { SubscriptionTable } from './SubscriptionTable'
import { SummaryStrip } from './SummaryStrip'

export type BucketFilter = 'all' | SubscriptionBucket
export type SubscriptionsView = 'board' | 'income'

interface SubscriptionsPageProps {
  month: MonthKey
  bucket: BucketFilter
  q: string
  view: SubscriptionsView
  onMonthChange: (month: MonthKey) => void
  onBucketChange: (bucket: BucketFilter) => void
  onQueryChange: (q: string) => void
  onViewChange: (view: SubscriptionsView) => void
}

interface PayTarget {
  studentId: string
  studentName: string
  studentPlanId: string
  planName: string | null
  suggestedAmount: number | null
}

interface PlanPrompt {
  title: string
  studentId: string
  studentName: string
  planName: string
  plan: Tables<'student_plans'>
}

const FILTER_TRIGGER_CLASS =
  'group inline-flex items-center gap-2 rounded-lg px-3 text-sm font-semibold after:hidden data-[state=active]:bg-surface-3 data-[state=active]:text-fg'
const COUNT_CLASS = 'inline-flex min-w-6 items-center justify-center rounded-full bg-surface-3 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-fg-muted'
const COUNT_TONE: Record<BadgeTone, string> = {
  neutral: '',
  rosa: 'bg-rosa-soft text-rosa-hover',
  dorado: 'bg-ambar-soft text-ambar',
  ok: 'bg-ok-soft text-ok',
  warn: 'bg-warn-soft text-warn',
  danger: 'bg-danger-soft text-danger',
}

function normalize(text: string): string {
  return text.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase()
}

export function SubscriptionsPage({ month, bucket, q, view, onMonthChange, onBucketChange, onQueryChange, onViewChange }: SubscriptionsPageProps) {
  const overview = useQuery(subscriptionsOverviewQuery(month))
  const plans = useQuery(plansQuery())
  const renew = useRenewPlan()
  const isDesktop = useMediaQuery('(min-width: 1024px)')

  const [renewingStudentId, setRenewingStudentId] = useState<string | null>(null)
  const [paying, setPaying] = useState<PayTarget | null>(null)
  const [assigning, setAssigning] = useState<SubscriptionRow | null>(null)
  const [freezing, setFreezing] = useState<SubscriptionRow | null>(null)
  const [prompt, setPrompt] = useState<PlanPrompt | null>(null)
  const [organizing, setOrganizing] = useState(false)

  const rows = overview.data
  const search = normalize(q.trim())
  const searched = rows?.filter((row) => search === '' || normalize(row.fullName).includes(search)) ?? []
  const visible = bucket === 'all' ? searched : searched.filter((row) => row.bucket === bucket)
  const countOf = (target: SubscriptionBucket) => searched.filter((row) => row.bucket === target).length

  function payTargetFor(row: SubscriptionRow): PayTarget | null {
    if (!row.studentPlanId) return null
    const owed = row.balance !== null && row.balance > 0 ? row.balance : null
    return {
      studentId: row.studentId,
      studentName: row.fullName,
      studentPlanId: row.studentPlanId,
      planName: row.planName,
      suggestedAmount: owed,
    }
  }

  const handlers: RowHandlers = {
    renewingStudentId,
    onPay: (row) => setPaying(payTargetFor(row)),
    onAssign: (row) => setAssigning(row),
    onFreeze: (row) => setFreezing(row),
    onRenew: (row) => {
      const sourceId = getRenewSourceId(row)
      if (!sourceId) return
      setRenewingStudentId(row.studentId)
      renew
        .mutateAsync(sourceId)
        .then(
          (plan) =>
            setPrompt({
              title: 'Plan renovado',
              studentId: row.studentId,
              studentName: row.fullName,
              planName: row.planName ?? row.prevPlanName ?? 'Plan',
              plan,
            }),
          () => undefined,
        )
        .finally(() => setRenewingStudentId(null))
    },
  }

  const thisMonth = currentMonthKey()

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        title="Membresías"
        icon={Wallet}
        iconTone="ambar"
        description="Quién renovó, quién debe y a quién recordarle. Cobra, renueva y avisa desde aquí."
        actions={
          <>
            <MonthNavigator month={month} onChange={onMonthChange} />
            <Button onClick={() => setOrganizing(true)}>
              <CalendarCheck className="size-4" aria-hidden /> Organizar mes
            </Button>
          </>
        }
      />

      <SummaryStrip month={month} rows={rows} />

      <SegmentedControl
        label="Vista"
        value={view}
        onValueChange={onViewChange}
        options={[
          {
            value: 'board',
            label: (
              <>
                <LayoutList className="size-4" aria-hidden /> Tablero
              </>
            ),
          },
          {
            value: 'income',
            label: (
              <>
                <ChartNoAxesColumn className="size-4" aria-hidden /> Ingresos
              </>
            ),
          },
        ]}
        className="w-full sm:w-fit [&>button]:flex-1"
      />

      {view === 'income' ? (
        <IncomePanel month={month} />
      ) : (
        <section aria-label="Tablero de membresías" className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <Tabs value={bucket} onValueChange={(value) => onBucketChange(value as BucketFilter)} className="min-w-0 lg:flex-1">
              <TabsList aria-label="Filtrar por situación" className="w-full gap-1 rounded-xl border border-line bg-surface p-1 lg:w-fit">
                <TabsTrigger value="all" className={FILTER_TRIGGER_CLASS}>
                  Todas <span className={cn(COUNT_CLASS, 'group-data-[state=active]:bg-surface-2')}>{searched.length}</span>
                </TabsTrigger>
                {SUBSCRIPTION_BUCKETS.map((item) => (
                  <TabsTrigger key={item} value={item} className={FILTER_TRIGGER_CLASS}>
                    {BUCKET_META[item].label}{' '}
                    <span className={cn(COUNT_CLASS, countOf(item) > 0 && COUNT_TONE[BUCKET_META[item].tone])}>
                      {countOf(item)}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <div className="relative w-full lg:w-72">
              <Search aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-subtle" />
              <Input
                type="search"
                aria-label="Buscar alumna"
                placeholder="Buscar alumna…"
                value={q}
                onChange={(e) => onQueryChange(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div role="tabpanel" aria-label={bucket === 'all' ? 'Todas las alumnas' : BUCKET_META[bucket].label}>
            <AsyncContent
              isLoading={overview.isLoading}
              error={overview.error}
              isEmpty={visible.length === 0}
              onRetry={() => overview.refetch()}
              loading={
                <>
                  {[0, 1, 2, 3].map((key) => (
                    <Skeleton key={key} className="h-28" />
                  ))}
                </>
              }
              empty={
                <EmptyState
                  illustration="people"
                  title={search !== '' ? 'Ninguna alumna coincide' : bucket === 'all' ? 'No hay alumnas activas' : 'Todo en orden por aquí'}
                  description={
                    search !== '' ? 'Prueba con otro nombre.' : bucket === 'all' ? 'Cuando apruebes alumnas aparecerán en el tablero.' : BUCKET_META[bucket].empty
                  }
                />
              }
            >
              {isDesktop ? (
                <SubscriptionTable rows={visible} month={month} handlers={handlers} />
              ) : (
                <ul className="flex flex-col gap-3">
                  {visible.map((row) => (
                    <li key={row.studentId}>
                      <SubscriptionCard row={row} month={month} handlers={handlers} />
                    </li>
                  ))}
                </ul>
              )}
            </AsyncContent>
          </div>
        </section>
      )}

      {paying && (
        <RegisterPaymentDialog
          studentId={paying.studentId}
          studentName={paying.studentName}
          studentPlanId={paying.studentPlanId}
          planName={paying.planName}
          suggestedAmount={paying.suggestedAmount}
          onClose={() => setPaying(null)}
        />
      )}
      {assigning && (
        <AssignPlanDialog
          studentId={assigning.studentId}
          studentName={assigning.fullName}
          defaultMonth={month === shiftMonth(thisMonth, 1) ? 'next' : 'current'}
          onClose={() => setAssigning(null)}
          onAssigned={(plan) =>
            setPrompt({
              title: 'Plan asignado',
              studentId: assigning.studentId,
              studentName: assigning.fullName,
              planName: plans.data?.find((item) => item.id === plan.plan_id)?.name ?? 'Plan',
              plan,
            })
          }
        />
      )}
      {freezing?.studentPlanId && (
        <FreezePlanDialog
          mode={freezing.isFrozen ? 'unfreeze' : 'freeze'}
          studentPlanId={freezing.studentPlanId}
          studentName={freezing.fullName}
          onClose={() => setFreezing(null)}
        />
      )}
      {prompt && (
        <PostRenewDialog
          title={prompt.title}
          studentName={prompt.studentName}
          planName={prompt.planName}
          renewed={prompt.plan}
          onClose={() => setPrompt(null)}
          onPay={() => {
            setPaying({
              studentId: prompt.studentId,
              studentName: prompt.studentName,
              studentPlanId: prompt.plan.id,
              planName: prompt.planName,
              suggestedAmount: prompt.plan.price,
            })
            setPrompt(null)
          }}
        />
      )}
      {organizing && <OrganizeMonthDialog initialMonth={month} onClose={() => setOrganizing(false)} />}
    </div>
  )
}
