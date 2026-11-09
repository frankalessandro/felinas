import { useQuery } from '@tanstack/react-query'
import { Plus, Ticket } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Button, ConfirmDialog, EmptyState, PageHeader, Skeleton, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { classTypesQuery } from '@/features/classes/queries'
import { useArchivePlan } from '../hooks/usePlanMutations'
import { categoriesQuery, plansQuery } from '../queries'
import type { PlanWithClassTypes } from '../types'
import { getPlanKind, PLAN_KIND_COPY, type PlanKind } from '../kind'
import { AssignToStudentDialog } from './AssignToStudentDialog'
import { PlanCard } from './PlanCard'
import { PlanFormDialog } from './PlanFormDialog'

type FormState = { plan: PlanWithClassTypes | null } | null

const KINDS: PlanKind[] = ['membership', 'single', 'private']

function HowItWorks({ kind }: { kind: PlanKind }) {
  return (
    <ol className="grid gap-3 rounded-2xl border border-line bg-surface/60 p-4 sm:grid-cols-3">
      {PLAN_KIND_COPY[kind].how.map((step, index) => (
        <li key={step} className="flex items-start gap-3 text-sm text-fg-muted">
          <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full bg-rosa-soft font-display text-xs font-bold text-rosa-hover">
            {index + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}

export function PlansPage() {
  const plansResult = useQuery(plansQuery())
  const classTypesResult = useQuery(classTypesQuery())
  const categoriesResult = useQuery(categoriesQuery())
  const archive = useArchivePlan()
  const [form, setForm] = useState<FormState>(null)
  const [archiving, setArchiving] = useState<PlanWithClassTypes | null>(null)
  const [assigning, setAssigning] = useState<PlanWithClassTypes | null>(null)
  const [kind, setKind] = useState<PlanKind>('membership')

  const plans = plansResult.data ?? []
  const classTypes = classTypesResult.data ?? []
  const categories = categoriesResult.data ?? []
  const renderCard = (plan: PlanWithClassTypes) => (
    <PlanCard key={plan.id} plan={plan} classTypes={classTypes} categories={categories} onEdit={() => setForm({ plan })} onArchive={() => setArchiving(plan)} onAssign={() => setAssigning(plan)} />
  )

  return (
    <div className="flex animate-fade-up flex-col gap-6">
      <PageHeader
        icon={Ticket}
        title="Planes"
        description="Membresías del mes, clases sueltas y sesiones personalizadas. Cada plan define qué estilos puede reservar la alumna."
        actions={
          <Button onClick={() => setForm({ plan: null })}>
            <Plus className="size-4" aria-hidden /> Nuevo plan
          </Button>
        }
      />

      <AsyncContent
        isLoading={plansResult.isLoading}
        error={plansResult.error}
        isEmpty={plans.length === 0}
        onRetry={() => plansResult.refetch()}
        loading={
          <div className="grid w-full gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[0, 1, 2].map((key) => (
              <Skeleton key={key} className="h-64" />
            ))}
          </div>
        }
        empty={
          <EmptyState
            illustration="ticket"
            title="Aún no hay planes"
            description="Crea un paquete o una mensualidad para poder asignarlo a las alumnas."
            action={<Button onClick={() => setForm({ plan: null })}>Crear plan</Button>}
          />
        }
      >
        <Tabs value={kind} onValueChange={(value) => setKind(value as PlanKind)}>
          <TabsList aria-label="Tipo de plan">
            {KINDS.map((item) => (
              <TabsTrigger key={item} value={item}>
                {PLAN_KIND_COPY[item].tab}
                <span className="ml-2 text-xs font-semibold tabular-nums text-fg-subtle">{plans.filter((plan) => getPlanKind(plan) === item).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          {KINDS.map((item) => {
            const items = plans.filter((plan) => getPlanKind(plan) === item)
            return (
              <TabsContent key={item} value={item} className="flex flex-col gap-5">
                <HowItWorks kind={item} />
                {items.length === 0 ? (
                  <EmptyState illustration="ticket" title={`Sin ${PLAN_KIND_COPY[item].tab.toLowerCase()}`} description="Crea un plan de este tipo para poder asignarlo." className="py-8" />
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{items.map(renderCard)}</div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </AsyncContent>

      {assigning && <AssignToStudentDialog plan={assigning} onClose={() => setAssigning(null)} />}
      {form && <PlanFormDialog plan={form.plan} onClose={() => setForm(null)} />}
      <ConfirmDialog
        open={archiving !== null}
        onOpenChange={(open) => !open && setArchiving(null)}
        title={`¿Archivar «${archiving?.name ?? ''}»?`}
        description="Dejará de poder asignarse. Las alumnas que ya lo tienen conservan su plan y su historial."
        confirmLabel="Archivar"
        tone="danger"
        onConfirm={() => (archiving ? archive.mutateAsync(archiving.id).then(() => undefined, () => undefined) : undefined)}
      />
    </div>
  )
}
