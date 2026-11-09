import { CalendarPlus, Check, MessageCircle, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import { Dialog, SegmentedControl } from '@/components/ui'
import { cn } from '@/lib/cn'
import { currentMonthKey, monthLabel, shiftMonth } from '../months'
import type { MonthKey } from '../months'
import { RenewStep } from './RenewStep'
import { SessionsStep } from './SessionsStep'
import { SummaryStep } from './SummaryStep'

type Step = 1 | 2 | 3

const STEPS: { step: Step; label: string; icon: LucideIcon }[] = [
  { step: 1, label: 'Renovar planes', icon: RefreshCw },
  { step: 2, label: 'Generar clases', icon: CalendarPlus },
  { step: 3, label: 'Avisar', icon: MessageCircle },
]

interface OrganizeMonthDialogProps {
  /** Mes que se está viendo en el tablero; si es el actual o el próximo, arranca ahí. */
  initialMonth: MonthKey
  onClose: () => void
}

function Stepper({ current, done }: { current: Step; done: ReadonlySet<Step> }) {
  return (
    <ol aria-label="Pasos" className="flex items-start">
      {STEPS.map(({ step, label, icon: Icon }, index) => {
        const isCurrent = step === current
        const isDone = done.has(step)
        return (
          <li key={step} aria-current={isCurrent ? 'step' : undefined} className="flex flex-1 items-start last:flex-none">
            <div className="flex w-20 flex-col items-center gap-1.5 text-center sm:w-28">
              <span
                aria-hidden
                className={cn(
                  'grid size-10 place-items-center rounded-full ring-1 ring-inset transition-colors duration-300',
                  isDone && 'bg-ok text-bg ring-ok',
                  isCurrent && !isDone && 'bg-rosa text-white ring-rosa',
                  !isCurrent && !isDone && 'bg-surface-3 text-fg-muted ring-line-strong/60',
                )}
              >
                {isDone ? <Check className="size-5" strokeWidth={3} /> : <Icon className="size-5" />}
              </span>
              <span className="sr-only">{`Paso ${step}${isDone ? ', hecho' : ''}: `}</span>
              <span className={cn('text-xs font-semibold leading-tight', isCurrent || isDone ? 'text-fg' : 'text-fg-muted')}>{label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <span aria-hidden className={cn('mt-5 h-0.5 flex-1 rounded-full transition-colors duration-300', isDone ? 'bg-ok' : 'bg-line-strong/60')} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

/** Guía de día 1 del mes: renovar planes, generar clases y avisar por WhatsApp. */
export function OrganizeMonthDialog({ initialMonth, onClose }: OrganizeMonthDialogProps) {
  const thisMonth = currentMonthKey()
  const nextMonth = shiftMonth(thisMonth, 1)
  const [month, setMonth] = useState<MonthKey>(initialMonth === nextMonth ? nextMonth : thisMonth)
  const [step, setStep] = useState<Step>(1)
  const [deselected, setDeselected] = useState<ReadonlySet<string>>(new Set())
  const [renewed, setRenewed] = useState<number | null>(null)
  const [renewedStudentIds, setRenewedStudentIds] = useState<string[]>([])
  const [created, setCreated] = useState<number | null>(null)

  const done = new Set<Step>()
  if (renewed !== null) done.add(1)
  if (created !== null) done.add(2)

  function changeMonth(next: MonthKey) {
    setMonth(next)
    setDeselected(new Set())
    setRenewed(null)
    setRenewedStudentIds([])
    setCreated(null)
    setStep(1)
  }

  function toggle(studentPlanId: string, selected: boolean) {
    setDeselected((prev) => {
      const next = new Set(prev)
      if (selected) next.delete(studentPlanId)
      else next.add(studentPlanId)
      return next
    })
  }

  function toggleAll(studentPlanIds: string[], selected: boolean) {
    setDeselected((prev) => {
      const next = new Set(prev)
      for (const id of studentPlanIds) {
        if (selected) next.delete(id)
        else next.add(id)
      }
      return next
    })
  }

  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title="Organizar el mes"
      description="Tu rutina del día 1: renueva, genera las clases y avisa."
      className="md:max-w-2xl"
    >
      <div className="flex flex-col gap-5 pb-2">
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-semibold text-fg">Mes a organizar</span>
          <SegmentedControl
            label="Mes a organizar"
            value={month}
            onValueChange={changeMonth}
            options={[
              { value: thisMonth, label: 'Este mes' },
              { value: nextMonth, label: 'Próximo mes' },
            ]}
            className="w-full [&>button]:flex-1"
          />
          <p className="font-display text-lg font-bold text-gradient-felinas">{monthLabel(month)}</p>
        </div>

        <Stepper current={step} done={done} />

        {step === 1 && (
          <RenewStep
            month={month}
            deselected={deselected}
            onToggle={toggle}
            onToggleAll={toggleAll}
            onRenewed={(count, studentIds) => {
              setRenewed(count)
              setRenewedStudentIds(studentIds)
              setStep(2)
            }}
            onSkip={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <SessionsStep
            month={month}
            created={created}
            onGenerated={(count) => setCreated(count)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <SummaryStep month={month} renewed={renewed} created={created} renewedStudentIds={renewedStudentIds} onFinish={onClose} />
        )}
      </div>
    </Dialog>
  )
}
