import { ChevronDown, Mail } from 'lucide-react'
import { Avatar, Button, DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger, EmptyState } from '@/components/ui'
import { formatters } from '@/lib/dates'
import type { UserProfile, UserRole } from '../types'
import { RoleMenuItems } from './RoleMenuItems'

interface PendingTabProps {
  users: UserProfile[]
  onApprove: (profile: UserProfile, role: UserRole) => void
}

function PendingUserCard({ profile, onApprove }: { profile: UserProfile; onApprove: (role: UserRole) => void }) {
  const name = profile.full_name ?? profile.email ?? 'Sin nombre'
  return (
    <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-line bg-surface p-4 pl-5 shadow-card sm:flex-row sm:items-center sm:justify-between">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5 bg-gradient-felinas" />
      <div className="flex min-w-0 items-center gap-3">
        <Avatar name={name} src={profile.avatar_url} size="lg" className="ring-2 ring-rosa/40" />
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="truncate font-display text-base font-bold">{name}</p>
          <p className="flex items-center gap-1.5 truncate text-sm text-fg-muted">
            <Mail className="size-3.5 shrink-0" aria-hidden /> {profile.email}
          </p>
          <p className="text-xs text-fg-subtle">Se registró el {formatters.shortDate(profile.created_at)}</p>
        </div>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button className="w-full sm:w-auto">
            Aprobar como… <ChevronDown className="size-4" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Rol de la cuenta</DropdownMenuLabel>
          <RoleMenuItems onSelect={onApprove} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export function PendingTab({ users, onApprove }: PendingTabProps) {
  if (users.length === 0) {
    return <EmptyState illustration="success" title="Todo al día" description="No hay solicitudes pendientes. Las nuevas cuentas aparecerán aquí." />
  }
  return (
    <ul className="flex flex-col gap-3">
      {users.map((profile) => (
        <li key={profile.id}>
          <PendingUserCard profile={profile} onApprove={(role) => onApprove(profile, role)} />
        </li>
      ))}
    </ul>
  )
}
