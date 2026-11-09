import { Archive, CalendarClock, MoreVertical, Pencil, Sparkles, Ticket, UserPlus } from 'lucide-react'
import { IconTile } from '@/components/brand'
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from '@/components/ui'
import type { ClassType } from '@/features/classes/types'
import { cn } from '@/lib/cn'
import { describePlan, describeQuotas, formatCOP } from '../format'
import { getPlanKind, PLAN_KIND_COPY, type PlanKind } from '../kind'
import type { ClassCategory, PlanWithClassTypes } from '../types'

interface PlanCardProps {
  plan: PlanWithClassTypes
  classTypes: ClassType[]
  categories: ClassCategory[]
  onEdit: () => void
  onArchive: () => void
  onAssign: () => void
}

const KIND_ICON = { membership: CalendarClock, single: Ticket, private: Sparkles } as const
const KIND_TONE: Record<PlanKind, 'rosa' | 'ambar'> = { membership: 'rosa', single: 'rosa', private: 'ambar' }

export function PlanCard({ plan, classTypes, categories, onEdit, onArchive, onAssign }: PlanCardProps) {
  const kind = getPlanKind(plan)
  const quotas = describeQuotas(plan.plan_category_quotas, categories)
  const allowed = classTypes.filter((type) => plan.plan_class_types.some((row) => row.class_type_id === type.id))

  return (
    <article
      className={cn(
        'relative flex h-full flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-5 shadow-card transition hover:border-line-strong',
        !plan.active && 'opacity-70',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute -right-14 -top-14 size-40 rounded-full opacity-20 blur-3xl',
          KIND_TONE[kind] === 'ambar' ? 'bg-ambar' : 'bg-rosa',
        )}
      />
      <div className="relative flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-3">
          <IconTile icon={KIND_ICON[kind]} tone={KIND_TONE[kind]} />
          <div className="flex min-w-0 flex-col gap-1">
            <h3 className="truncate font-display text-lg font-bold leading-tight">{plan.name}</h3>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone={kind === 'private' ? 'dorado' : 'neutral'}>{PLAN_KIND_COPY[kind].label}</Badge>
              {!plan.active && <Badge tone="warn">Inactivo</Badge>}
            </div>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <IconButton aria-label={`Acciones de ${plan.name}`} className="-mr-2 -mt-2">
              <MoreVertical className="size-5" aria-hidden />
            </IconButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={onEdit}>
              <Pencil className="size-4" aria-hidden /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem tone="danger" onSelect={onArchive}>
              <Archive className="size-4" aria-hidden /> Archivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="relative">
        <p className="font-display text-3xl font-bold leading-none tabular-nums">{formatCOP(plan.price)}</p>
        <p className="mt-1.5 text-sm font-medium text-fg-muted">{describePlan(plan)}</p>
        {quotas && (
          <p className="mt-1 text-xs font-semibold text-ambar">
            <span className="sr-only">Reparto por categoría: </span>
            {quotas}
          </p>
        )}
      </div>

      {plan.description && <p className="relative text-sm text-fg-muted">{plan.description}</p>}

      {plan.active && (
        <Button variant="secondary" size="sm" onClick={onAssign} className="relative min-h-11 w-full">
          <UserPlus className="size-4" aria-hidden />
          Asignar a una alumna
        </Button>
      )}

      <div className="relative mt-auto flex flex-col gap-2 border-t border-line pt-4">
        <p className="text-xs font-semibold text-fg-subtle">Da acceso a</p>
        <div className="flex flex-wrap gap-1.5">
          {allowed.length === 0 ? (
            <span className="text-xs text-warn">Sin estilos: no se puede reservar</span>
          ) : (
            allowed.map((type) => (
              <Badge key={type.id} color={type.color}>
                {type.name}
              </Badge>
            ))
          )}
        </div>
      </div>
    </article>
  )
}
