import { useQuery } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AsyncContent, Button, Card, ConfirmDialog, EmptyState } from '@/components/ui'
import { PaymentList } from '@/features/payments/components/PaymentList'
import { RegisterPaymentDialog } from '@/features/payments/components/RegisterPaymentDialog'
import { SetPriceDialog } from '@/features/payments/components/SetPriceDialog'
import { studentPaymentsQuery } from '@/features/payments/queries'
import { plansQuery } from '@/features/plans/queries'
import { FreezePlanDialog } from '@/features/subscriptions/components/FreezePlanDialog'
import { PostRenewDialog } from '@/features/subscriptions/components/PostRenewDialog'
import { useRenewPlan } from '@/features/subscriptions/hooks/useSubscriptionMutations'
import type { StudentPlanRow } from '@/features/subscriptions/types'
import { formatCOP } from '@/lib/money'
import { useCancelStudentPlan } from '../hooks/useStudentMutations'
import { studentPlanDetailsQuery } from '../queries'
import type { StudentPlanDetail } from '../types'
import { AssignPlanDialog } from './AssignPlanDialog'
import { StudentPlanCard } from './StudentPlanCard'

interface StudentPlansTabProps {
  studentId: string
  studentName: string
}

interface PayTarget {
  studentPlanId: string
  planName: string | null
  suggestedAmount: number | null
}

interface RenewPrompt {
  title: string
  planName: string
  plan: StudentPlanRow
}

export function StudentPlansTab({ studentId, studentName }: StudentPlansTabProps) {
  const query = useQuery(studentPlanDetailsQuery(studentId))
  const paymentsQuery = useQuery(studentPaymentsQuery(studentId))
  const catalog = useQuery(plansQuery())
  const cancel = useCancelStudentPlan()
  const renew = useRenewPlan()

  const [assigning, setAssigning] = useState(false)
  const [cancelling, setCancelling] = useState<StudentPlanDetail | null>(null)
  const [paying, setPaying] = useState<PayTarget | null>(null)
  const [pricing, setPricing] = useState<StudentPlanDetail | null>(null)
  const [freezing, setFreezing] = useState<StudentPlanDetail | null>(null)
  const [renewingId, setRenewingId] = useState<string | null>(null)
  const [prompt, setPrompt] = useState<RenewPrompt | null>(null)

  const plans = query.data ?? []
  const payments = paymentsQuery.data ?? []
  const firstRenewable = plans.find((plan) => plan.effective_status !== 'cancelled')
  const totalOwed = plans.reduce((sum, plan) => (plan.effective_status === 'cancelled' ? sum : sum + Math.max(0, plan.balance ?? 0)), 0)
  const loosePayments = payments.filter((payment) => payment.student_plan_id === null)

  function renewPlan(plan: StudentPlanDetail) {
    setRenewingId(plan.student_plan_id)
    renew
      .mutateAsync(plan.student_plan_id)
      .then((renewed) => setPrompt({ title: 'Plan renovado', planName: plan.plan_name ?? 'Plan', plan: renewed }), () => undefined)
      .finally(() => setRenewingId(null))
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-fg-muted">Planes por mes, pagos, saldo y congelaciones.</p>
        <Button onClick={() => setAssigning(true)}>
          <Plus className="size-4" aria-hidden /> Asignar plan
        </Button>
      </div>

      <AsyncContent
        isLoading={query.isLoading}
        error={query.error}
        isEmpty={plans.length === 0}
        onRetry={() => query.refetch()}
        empty={
          <EmptyState
            illustration="ticket"
            title="Sin planes asignados"
            description="Asígnale un plan para que pueda reservar clases."
            action={<Button onClick={() => setAssigning(true)}>Asignar plan</Button>}
          />
        }
      >
        <div className="flex flex-col gap-4">
          {totalOwed > 0 && (
            <Card className="flex flex-wrap items-center justify-between gap-2 border-warn/30 p-4">
              <p className="text-sm font-semibold">Saldo pendiente</p>
              <p className="font-display text-2xl font-bold tabular-nums text-warn">{formatCOP(totalOwed)}</p>
            </Card>
          )}
          <ul className="flex flex-col gap-4">
            {plans.map((plan) => (
              <li key={plan.student_plan_id}>
                <StudentPlanCard
                  plan={plan}
                  payments={payments.filter((payment) => payment.student_plan_id === plan.student_plan_id)}
                  canRenew={plan.student_plan_id === firstRenewable?.student_plan_id}
                  renewing={renewingId === plan.student_plan_id}
                  onPay={() =>
                    setPaying({
                      studentPlanId: plan.student_plan_id,
                      planName: plan.plan_name,
                      suggestedAmount: plan.balance !== null && plan.balance > 0 ? plan.balance : null,
                    })
                  }
                  onSetPrice={() => setPricing(plan)}
                  onToggleFreeze={() => setFreezing(plan)}
                  onRenew={() => renewPlan(plan)}
                  onCancel={() => setCancelling(plan)}
                />
              </li>
            ))}
          </ul>
          {loosePayments.length > 0 && (
            <Card className="flex flex-col gap-3 p-4 sm:p-5">
              <h3 className="font-display text-base font-bold">Pagos sin plan</h3>
              <PaymentList payments={loosePayments} />
            </Card>
          )}
        </div>
      </AsyncContent>

      {assigning && (
        <AssignPlanDialog
          studentId={studentId}
          studentName={studentName}
          onClose={() => setAssigning(false)}
          onAssigned={(plan) =>
            setPrompt({ title: 'Plan asignado', planName: catalog.data?.find((item) => item.id === plan.plan_id)?.name ?? 'Plan', plan })
          }
        />
      )}
      {paying && (
        <RegisterPaymentDialog
          studentId={studentId}
          studentName={studentName}
          studentPlanId={paying.studentPlanId}
          planName={paying.planName}
          suggestedAmount={paying.suggestedAmount}
          onClose={() => setPaying(null)}
        />
      )}
      {pricing && (
        <SetPriceDialog
          studentPlanId={pricing.student_plan_id}
          planName={pricing.plan_name ?? 'el plan'}
          currentPrice={pricing.price}
          discountNote={pricing.discount_note}
          catalogPrice={catalog.data?.find((item) => item.id === pricing.plan_id)?.price}
          onClose={() => setPricing(null)}
        />
      )}
      {freezing && (
        <FreezePlanDialog
          mode={freezing.is_frozen ? 'unfreeze' : 'freeze'}
          studentPlanId={freezing.student_plan_id}
          studentName={studentName}
          onClose={() => setFreezing(null)}
        />
      )}
      {prompt && (
        <PostRenewDialog
          title={prompt.title}
          studentName={studentName}
          planName={prompt.planName}
          renewed={prompt.plan}
          onClose={() => setPrompt(null)}
          onPay={() => {
            const target = prompt
            setPrompt(null)
            setPaying({ studentPlanId: target.plan.id, planName: target.planName, suggestedAmount: target.plan.price })
          }}
        />
      )}
      <ConfirmDialog
        open={cancelling !== null}
        onOpenChange={(open) => !open && setCancelling(null)}
        title="¿Cancelar este plan?"
        description="La alumna ya no podrá reservar con él. Las clases ya asistidas se conservan en su historial."
        confirmLabel="Cancelar plan"
        cancelLabel="Volver"
        tone="danger"
        onConfirm={() => (cancelling ? cancel.mutateAsync(cancelling.student_plan_id).then(() => undefined, () => undefined) : undefined)}
      />
    </div>
  )
}
