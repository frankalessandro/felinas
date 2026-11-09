import { CalendarClock, CircleCheck, Hourglass, Layers, Undo2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconTile, type Tone } from '@/components/brand'

interface Rule {
  icon: LucideIcon
  tone: Tone
  title: string
  body: string
}

const RULES: Rule[] = [
  {
    icon: CalendarClock,
    tone: 'rosa',
    title: 'Tu plan es del mes',
    body: 'Cada plan vence el último día del mes. Las clases que no uses se pierden: no pasan al mes siguiente. Si lo congelas con la academia, el vencimiento se corre los días congelados.',
  },
  {
    icon: Undo2,
    tone: 'violeta',
    title: 'Cancela gratis hasta que empiece',
    body: 'Puedes cancelar tu reserva cuando quieras, hasta la hora de inicio de la clase. Cancelar no gasta ninguna clase.',
  },
  {
    icon: CircleCheck,
    tone: 'ok',
    title: 'Solo la asistencia descuenta',
    body: 'Una clase se descuenta de tu plan cuando la academia marca que asististe. Reservar, faltar o cancelar no la consumen.',
  },
  {
    icon: Hourglass,
    tone: 'ambar',
    title: 'Lista de espera automática',
    body: 'Si la clase está llena entras a la lista de espera. Si alguien cancela, subes sola y te avisamos.',
  },
  {
    icon: Layers,
    tone: 'cian',
    title: 'Tu plan define qué reservas',
    body: 'Cada plan incluye ciertos estilos y, en los combos, un máximo de clases por categoría (ej. Twerk y Urbano). Las personalizadas las agenda la academia contigo.',
  },
]

/** Reglas del plan como lista con icono; sin numeración decorativa. */
export function PlanRules() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {RULES.map(({ icon, tone, title, body }) => (
        <li key={title} className="flex gap-3 rounded-2xl border border-line bg-surface p-4">
          <IconTile icon={icon} tone={tone} />
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="font-display text-sm font-bold">{title}</h3>
            <p className="text-sm text-fg-muted">{body}</p>
          </div>
        </li>
      ))}
    </ul>
  )
}
