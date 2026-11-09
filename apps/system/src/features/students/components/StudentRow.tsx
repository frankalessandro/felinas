import { Link } from '@tanstack/react-router'
import { ChevronRight, Phone } from 'lucide-react'
import { Stamp } from '@/components/brand'
import { Avatar } from '@/components/ui'
import { WhatsAppButton } from '@/components/WhatsAppButton'
import { cn } from '@/lib/cn'
import type { StudentListItem } from '../types'
import { ActivePlanSummary, PlanWarningBadges } from './PlanStatus'
import { STUDENT_ROW_GRID } from './studentRowLayout'

export function StudentRow({ item }: { item: StudentListItem }) {
  const { profile, activePlan } = item
  const name = profile.full_name ?? profile.email ?? 'Sin nombre'
  const isInactive = profile.status === 'inactive'

  return (
    <li
      className={cn(
        'flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 transition hover:border-rosa/50 hover:bg-surface-2/50',
        STUDENT_ROW_GRID,
        isInactive && 'opacity-70',
      )}
    >
      <Link to="/admin/students/$studentId" params={{ studentId: profile.id }} className="group flex min-h-11 min-w-0 items-center gap-3 rounded-xl">
        <Avatar name={name} src={profile.avatar_url} size="lg" />
        <span className="flex min-w-0 flex-col gap-1">
          <span className="truncate font-display text-base font-bold group-hover:text-rosa-hover">{name}</span>
          <span className="truncate text-xs text-fg-muted">{profile.email}</span>
        </span>
      </Link>

      <p className="flex items-center gap-2 text-sm text-fg-muted">
        <Phone className="size-4 shrink-0 text-fg-subtle" aria-hidden />
        {profile.phone ?? <span className="text-fg-subtle">Sin teléfono</span>}
      </p>

      <div className="flex flex-col gap-2">
        <ActivePlanSummary plan={activePlan} />
        <div className="flex flex-wrap items-center gap-1.5">
          <Stamp tone={isInactive ? 'muted' : 'ok'}>{isInactive ? 'Inactiva' : 'Activa'}</Stamp>
          {!isInactive && <PlanWarningBadges plan={activePlan} />}
        </div>
      </div>

      <div className="flex items-center gap-2 md:justify-end">
        <WhatsAppButton phone={profile.phone} name={name} size="icon" />
        <Link
          to="/admin/students/$studentId"
          params={{ studentId: profile.id }}
          aria-label={`Ver ficha de ${name}`}
          className="ml-auto flex size-11 items-center justify-center rounded-xl border border-line text-fg-muted transition hover:border-rosa hover:bg-rosa-soft hover:text-rosa-hover md:ml-0"
        >
          <ChevronRight className="size-5" aria-hidden />
        </Link>
      </div>
    </li>
  )
}
