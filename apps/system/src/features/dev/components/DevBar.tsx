import { Link, useNavigate } from '@tanstack/react-router'
import { FlaskConical } from 'lucide-react'
import { ROLE_HOME, ROLE_LABEL } from '@/features/auth/roles'
import type { Profile, UserRole } from '@/features/auth/types'
import { cn } from '@/lib/cn'
import { isDeveloper, useEffectiveRole } from '../effectiveRole'
import { useDevViewStore } from '../store'

const QUICK_ROLES: UserRole[] = ['admin', 'teacher', 'student']

/** Barra fina del modo beta: indica con qué rol se está viendo la app y permite saltar entre roles. */
export function DevBar({ profile }: { profile: Profile }) {
  const effectiveRole = useEffectiveRole(profile)
  const { teacherId, setView } = useDevViewStore()
  const navigate = useNavigate()

  if (!isDeveloper(profile)) return null

  function switchTo(role: UserRole) {
    // Para ver como profe hay que elegir cuál: eso se hace en /beta.
    if (role === 'teacher' && !teacherId) {
      void navigate({ to: '/beta' })
      return
    }
    setView(role, role === 'teacher' ? teacherId : null)
    void navigate({ to: ROLE_HOME[role] })
  }

  return (
    <div className="flex h-10 shrink-0 items-center justify-between gap-2 border-b border-dorado/30 bg-[color-mix(in_srgb,var(--color-dorado)_12%,var(--color-bg))] px-3 text-xs backdrop-blur sm:px-4">
      <Link to="/beta" className="flex min-w-0 items-center gap-1.5 font-bold text-dorado hover:underline">
        <FlaskConical className="size-3.5 shrink-0" aria-hidden />
        <span className="truncate">
          BETA<span className="hidden sm:inline"> · viendo como {ROLE_LABEL[effectiveRole].toLowerCase()}</span>
        </span>
      </Link>
      <div role="radiogroup" aria-label="Cambiar de rol" className="flex gap-1">
        {QUICK_ROLES.map((role) => (
          <button
            key={role}
            type="button"
            role="radio"
            aria-checked={effectiveRole === role}
            onClick={() => switchTo(role)}
            className={cn(
              'h-7 rounded-lg px-2.5 font-semibold transition',
              effectiveRole === role ? 'bg-dorado text-bg' : 'text-fg-muted hover:bg-surface-2 hover:text-fg',
            )}
          >
            {ROLE_LABEL[role].split(' ')[0]}
          </button>
        ))}
      </div>
    </div>
  )
}
