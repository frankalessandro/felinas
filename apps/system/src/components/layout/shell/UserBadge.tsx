import { LogOut } from 'lucide-react'
import { Avatar } from '@/components/ui'
import { useCurrentProfile, useSignOut } from '@/features/auth/hooks/useAuth'
import { ROLE_LABEL } from '@/features/auth/roles'
import { useEffectiveRole } from '@/features/dev/effectiveRole'
import { cn } from '@/lib/cn'

export function UserBadge({ className }: { className?: string }) {
  const profile = useCurrentProfile()
  const role = useEffectiveRole(profile)
  const name = profile.full_name ?? profile.email ?? 'Felina'
  return (
    <div className={cn('flex min-w-0 items-center gap-3', className)}>
      <Avatar name={name} src={profile.avatar_url ?? undefined} size="md" className="ring-2 ring-rosa/30" />
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="truncate text-xs text-fg-subtle">{ROLE_LABEL[role]}</p>
      </div>
    </div>
  )
}

export function SignOutButton({ className }: { className?: string }) {
  const signOut = useSignOut()
  return (
    <button
      type="button"
      onClick={() => signOut.mutate()}
      disabled={signOut.isPending}
      className={cn(
        'inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-medium text-fg-subtle transition hover:bg-surface-3 hover:text-fg disabled:opacity-50',
        className,
      )}
    >
      <LogOut className="size-4" aria-hidden />
      Cerrar sesión
    </button>
  )
}
