import { CalendarDays, Clock, DoorOpen, Hourglass, Signal } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { IconTile, Stamp } from '@/components/brand'
import { Avatar, CapacityBar, Dialog } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { formatters } from '@/lib/dates'
import type { BookingEligibility } from '../eligibility'
import { LEVEL_LABEL } from '../labels'
import { BookingActionButton } from './BookingActionButton'

interface SessionDetailSheetProps {
  session: SessionWithDetails | null
  eligibility: BookingEligibility | null
  pending: boolean
  onClose: () => void
  onBook: () => void
  onCancel: () => void
}

function InfoRow({ icon, children }: { icon: LucideIcon; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3 text-sm">
      <IconTile icon={icon} tone="neutral" size="sm" />
      <span className="min-w-0 flex-1">{children}</span>
    </li>
  )
}

function describeSpots(session: SessionWithDetails): string {
  const free = session.capacity - session.booked_count
  if (free <= 0) {
    return session.waitlist_count > 0 ? `Cupo lleno · ${session.waitlist_count} en lista de espera` : 'Cupo lleno'
  }
  return free === 1 ? 'Queda 1 cupo' : `Quedan ${free} cupos`
}

export function SessionDetailSheet({ session, eligibility, pending, onClose, onBook, onCancel }: SessionDetailSheetProps) {
  const title = session?.title ?? session?.class_type?.name ?? 'Clase'
  const color = session?.class_type?.color

  return (
    <Dialog
      open={session !== null}
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={session ? `${formatters.fullDate(session.starts_at)} · ${formatters.timeRange(session.starts_at, session.ends_at)}` : undefined}
      footer={
        eligibility && (
          <BookingActionButton eligibility={eligibility} pending={pending} onBook={onBook} onCancel={onCancel} context="sheet" />
        )
      }
    >
      {session && (
        <div className="flex flex-col gap-5">
          <div className="relative flex items-center gap-4 overflow-hidden rounded-2xl border border-line bg-surface-2 p-4 pl-5">
            <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: color ?? 'var(--color-rosa)' }} />
            <div className="flex w-14 shrink-0 flex-col items-center rounded-xl bg-surface-3 py-2 leading-none">
              <span className="text-[11px] font-semibold capitalize text-fg-muted">{formatters.weekdayShort(session.starts_at)}</span>
              <span className="mt-1 font-display text-2xl font-bold tabular-nums">{formatters.dayNumber(session.starts_at)}</span>
            </div>
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="font-display text-lg font-bold leading-tight">{formatters.time(session.starts_at)}</p>
              <div className="flex flex-wrap items-center gap-2">
                {session.class_type && (
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
                    <span aria-hidden className="size-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {session.class_type.name}
                  </span>
                )}
                {session.kind === 'private' && <Stamp tone="dorado">Personalizada</Stamp>}
                {session.status === 'cancelled' && <Stamp tone="danger">Cancelada</Stamp>}
                {eligibility?.badge && <Stamp tone={eligibility.badge.tone === 'neutral' ? 'muted' : eligibility.badge.tone}>{eligibility.badge.label}</Stamp>}
              </div>
            </div>
          </div>

          {session.description && <p className="text-sm text-fg-muted">{session.description}</p>}

          <ul className="flex flex-col gap-3">
            {session.teacher && (
              <li className="flex items-center gap-3">
                <Avatar name={session.teacher.full_name} src={session.teacher.photo_url} size="md" />
                <div className="flex flex-col">
                  <span className="text-xs text-fg-subtle">Profe</span>
                  <span className="font-display text-sm font-bold">{session.teacher.full_name}</span>
                </div>
              </li>
            )}
            {session.room && (
              <InfoRow icon={DoorOpen}>
                <span className="text-fg-muted">Salón </span>
                <span className="font-semibold">{session.room.name}</span>
              </InfoRow>
            )}
            <InfoRow icon={Clock}>
              <span className="font-semibold">{formatters.timeRange(session.starts_at, session.ends_at)}</span>
            </InfoRow>
            <InfoRow icon={CalendarDays}>
              <span className="capitalize">{formatters.fullDate(session.starts_at)}</span>
            </InfoRow>
            {session.class_type && (
              <InfoRow icon={Signal}>{LEVEL_LABEL[session.class_type.level]}</InfoRow>
            )}
          </ul>

          {session.status === 'scheduled' && (
            <div className="flex flex-col gap-2 rounded-2xl border border-line bg-surface-2 p-4">
              <CapacityBar booked={session.booked_count} capacity={session.capacity} />
              <p className="flex items-center gap-2 text-sm text-fg-muted">
                <Hourglass className="size-4 shrink-0" aria-hidden />
                {describeSpots(session)}
              </p>
            </div>
          )}

          {eligibility?.message && <p className="rounded-2xl bg-surface-3 p-4 text-sm text-fg-muted">{eligibility.message}</p>}
        </div>
      )}
    </Dialog>
  )
}
