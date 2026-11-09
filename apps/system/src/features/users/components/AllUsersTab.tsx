import { MoreVertical, Power, Search } from 'lucide-react'
import { useState } from 'react'
import {
  Avatar,
  Badge,
  ConfirmDialog,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  EmptyState,
  IconButton,
  Input,
} from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/cn'
import { ROLE_LABELS, ROLE_TONES, STATUS_LABELS } from '../constants'
import { useSetUserStatus } from '../hooks/useUserMutations'
import type { UserProfile, UserRole } from '../types'
import { RoleMenuItems } from './RoleMenuItems'

interface AllUsersTabProps {
  users: UserProfile[]
  onChangeRole: (profile: UserProfile, role: UserRole) => void
}

function matches(profile: UserProfile, term: string): boolean {
  if (!term) return true
  return `${profile.full_name ?? ''} ${profile.email ?? ''}`.toLowerCase().includes(term)
}

interface UserRowProps {
  profile: UserProfile
  isSelf: boolean
  onChangeRole: (role: UserRole) => void
  onToggleStatus: () => void
}

function UserRow({ profile, isSelf, onChangeRole, onToggleStatus }: UserRowProps) {
  const name = profile.full_name ?? profile.email ?? 'Sin nombre'
  const status = STATUS_LABELS[profile.status]
  const canToggle = profile.status !== 'pending'

  return (
    <li className={cn('flex items-center gap-3 rounded-2xl border border-line bg-surface p-3 pr-2 transition hover:border-rosa/50', profile.status === 'inactive' && 'opacity-70')}>
      <Avatar name={name} src={profile.avatar_url} />
      <div className="flex min-w-0 flex-1 flex-col">
        <p className="truncate font-display text-sm font-bold">
          {name} {isSelf && <span className="font-body text-xs font-normal text-fg-subtle">(tú)</span>}
        </p>
        <p className="truncate text-xs text-fg-muted">{profile.email}</p>
      </div>
      <div className="hidden flex-wrap justify-end gap-1.5 sm:flex">
        <Badge tone={ROLE_TONES[profile.role]}>{ROLE_LABELS[profile.role]}</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <div className="flex flex-col items-end gap-1 sm:hidden">
        <Badge tone={ROLE_TONES[profile.role]}>{ROLE_LABELS[profile.role]}</Badge>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton aria-label={`Acciones de ${name}`} disabled={isSelf}>
            <MoreVertical className="size-5" aria-hidden />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Cambiar rol a</DropdownMenuLabel>
          <RoleMenuItems exclude={profile.role} onSelect={onChangeRole} />
          {canToggle && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem tone={profile.status === 'active' ? 'danger' : 'default'} onSelect={onToggleStatus}>
                <Power className="size-4" aria-hidden /> {profile.status === 'active' ? 'Desactivar cuenta' : 'Reactivar cuenta'}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </li>
  )
}

export function AllUsersTab({ users, onChangeRole }: AllUsersTabProps) {
  const current = useCurrentProfile()
  const setStatus = useSetUserStatus()
  const [search, setSearch] = useState('')
  const [deactivating, setDeactivating] = useState<UserProfile | null>(null)

  const term = search.trim().toLowerCase()
  const visible = users.filter((profile) => matches(profile, term))

  function toggleStatus(profile: UserProfile) {
    if (profile.status === 'active') setDeactivating(profile)
    else setStatus.mutate({ id: profile.id, status: 'active' })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-fg-subtle" aria-hidden />
        <Input type="search" aria-label="Buscar usuario" placeholder="Buscar por nombre o correo…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-11" />
      </div>

      {visible.length === 0 ? (
        <EmptyState illustration="search" title="Sin resultados" description="Ningún usuario coincide con la búsqueda." />
      ) : (
        <ul className="flex flex-col gap-2">
          {visible.map((profile) => (
            <UserRow
              key={profile.id}
              profile={profile}
              isSelf={profile.id === current.id}
              onChangeRole={(role) => onChangeRole(profile, role)}
              onToggleStatus={() => toggleStatus(profile)}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={deactivating !== null}
        onOpenChange={(open) => !open && setDeactivating(null)}
        title={`¿Desactivar a ${deactivating?.full_name ?? deactivating?.email ?? 'esta cuenta'}?`}
        description="No podrá entrar a la app hasta que la reactives. No se borra ningún dato."
        confirmLabel="Desactivar"
        tone="danger"
        onConfirm={() => (deactivating ? setStatus.mutateAsync({ id: deactivating.id, status: 'inactive' }).then(() => undefined, () => undefined) : undefined)}
      />
    </div>
  )
}
