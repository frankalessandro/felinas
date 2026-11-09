import { useQuery } from '@tanstack/react-query'
import { FlaskConical } from 'lucide-react'
import { env } from '@/lib/env'
import { LOCAL_USER_STORAGE_KEY } from '@/lib/localDb'
import type { Enums } from '@/types/database'

interface LocalUser {
  email: string
  full_name: string | null
  role: Enums<'user_role'>
  status: Enums<'profile_status'>
}

const ROLE_LABEL: Record<Enums<'user_role'>, string> = { admin: 'Admin', teacher: 'Profe', student: 'Alumna' }
const STATUS_LABEL: Partial<Record<Enums<'profile_status'>, string>> = { pending: ' · pendiente' }

async function fetchLocalUsers(postgrestUrl: string): Promise<LocalUser[]> {
  const response = await fetch(`${postgrestUrl}/rpc/dev_users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{}',
  })
  if (!response.ok) throw new Error('No se pudo listar los usuarios de prueba')
  return response.json() as Promise<LocalUser[]>
}

function readActive(fallback: string): string {
  try {
    return window.localStorage.getItem(LOCAL_USER_STORAGE_KEY) ?? fallback
  } catch {
    return fallback
  }
}

/** Solo en modo local: cambia de usuario de prueba (admin, profe, alumna…) sin login ni tocar el .env. */
export function LocalUserSwitcher() {
  if (!env.useLocalDb) return null
  return <Switcher postgrestUrl={env.postgrestUrl} defaultEmail={env.localUser} />
}

function Switcher({ postgrestUrl, defaultEmail }: { postgrestUrl: string; defaultEmail: string }) {
  const users = useQuery({ queryKey: ['dev', 'local-users'], queryFn: () => fetchLocalUsers(postgrestUrl), staleTime: 0 })
  const active = readActive(defaultEmail)

  function switchTo(email: string) {
    try {
      window.localStorage.setItem(LOCAL_USER_STORAGE_KEY, email)
    } catch {
      return
    }
    // Recarga completa: descarta la caché y la sesión del usuario anterior.
    window.location.assign('/')
  }

  return (
    <div className="fixed bottom-3 left-3 z-[60] flex max-w-[calc(100vw-1.5rem)] items-center gap-2 rounded-2xl border border-ambar/40 bg-surface/95 py-1.5 pl-3 pr-2 shadow-card backdrop-blur">
      <FlaskConical className="size-4 shrink-0 text-ambar" aria-hidden />
      <label htmlFor="local-user" className="sr-only">
        Usuario de prueba
      </label>
      <select
        id="local-user"
        value={active}
        onChange={(event) => switchTo(event.target.value)}
        className="min-h-9 min-w-0 rounded-lg bg-surface-2 px-2 text-xs font-semibold text-fg outline-none focus-visible:ring-2 focus-visible:ring-rosa"
      >
        {!users.data?.some((user) => user.email === active) && <option value={active}>{active}</option>}
        {users.data?.map((user) => (
          <option key={user.email} value={user.email}>
            {ROLE_LABEL[user.role]} · {user.full_name ?? user.email}
            {STATUS_LABEL[user.status] ?? ''}
          </option>
        ))}
      </select>
    </div>
  )
}
