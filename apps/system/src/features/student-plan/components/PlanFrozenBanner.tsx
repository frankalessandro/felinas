import { Snowflake } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { formatters } from '@/lib/dates'
import type { StudentPlan } from '../types'

export function PlanFrozenBanner({ plan }: { plan: StudentPlan }) {
  const since = plan.frozenAt ? ` desde el ${formatters.dayMonth(plan.frozenAt)}` : ''
  return (
    <div role="status" className="flex items-center gap-4 rounded-2xl border border-cian/30 bg-cian-soft p-4">
      <IconTile icon={Snowflake} tone="cian" />
      <div className="flex min-w-0 flex-col gap-0.5">
        <p className="font-display text-sm font-bold text-cian">Tu plan está congelado</p>
        <p className="text-sm text-fg-muted">
          {plan.name} está congelado{since}: no puedes reservar hasta que la academia lo reactive. Tus reservas ya hechas se conservan y, al
          reactivarlo, tu vencimiento se corre los días congelados.
        </p>
      </div>
    </div>
  )
}
