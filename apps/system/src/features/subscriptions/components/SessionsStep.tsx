import { Link } from '@tanstack/react-router'
import { CalendarCheck, CalendarDays } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Button, buttonVariants } from '@/components/ui'
import { useGenerateMonthSessions } from '../hooks/useSubscriptionMutations'
import { monthLabel, monthStart } from '../months'
import type { MonthKey } from '../months'

interface SessionsStepProps {
  month: MonthKey
  created: number | null
  onGenerated: (created: number) => void
  onNext: () => void
}

/** Paso 2: crear las clases del mes desde los horarios activos (idempotente). */
export function SessionsStep({ month, created, onGenerated, onNext }: SessionsStepProps) {
  const generate = useGenerateMonthSessions()

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-fg-muted">
        Crea las clases de {monthLabel(month)} a partir de los horarios activos. Si ya estaban creadas no se duplican, así que puedes repetir este paso sin
        miedo. Antes de generar, revisa que los horarios del mes estén actualizados en Clases.
      </p>

      {created !== null && (
        <div role="status" className="animate-fade-up flex items-center gap-3 rounded-2xl border border-ok/30 bg-ok-soft p-4 text-sm">
          <IconTile icon={CalendarCheck} tone="ok" />
          <p>
            {created > 0 ? (
              <>
                Se {created === 1 ? 'creó' : 'crearon'} <span className="font-display font-bold tabular-nums">{created}</span> {created === 1 ? 'clase' : 'clases'} en{' '}
                {monthLabel(month)}.
              </>
            ) : (
              <>No se creó ninguna clase nueva: {monthLabel(month)} ya estaba generado.</>
            )}
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant={created === null ? 'primary' : 'secondary'}
          loading={generate.isPending}
          onClick={() => generate.mutateAsync(month).then(onGenerated, () => undefined)}
        >
          <CalendarDays className="size-4" aria-hidden /> {created === null ? `Generar clases de ${monthLabel(month)}` : 'Volver a generar'}
        </Button>
        <Link to="/admin/agenda" search={{ view: 'month', date: monthStart(month) }} className={buttonVariants({ variant: 'outline' })}>
          Revisar en la agenda
        </Link>
      </div>

      <div className="flex justify-end">
        <Button variant={created === null ? 'ghost' : 'primary'} onClick={onNext}>
          {created === null ? 'Saltar este paso' : 'Siguiente'}
        </Button>
      </div>
    </div>
  )
}
