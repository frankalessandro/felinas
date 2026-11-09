import { useQueryClient } from '@tanstack/react-query'
import { getRouteApi, useRouter } from '@tanstack/react-router'
import { LogOut, Mail, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { IconTile, Stamp } from '@/components/brand'
import { Illustration } from '@/components/illustrations/Illustration'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui'
import { useSignOut } from '../hooks/useAuth'
import { authKeys } from '../queries'

const route = getRouteApi('/pending')

export function PendingApprovalScreen() {
  const { profile } = route.useRouteContext()
  const queryClient = useQueryClient()
  const router = useRouter()
  const signOut = useSignOut()
  const [checking, setChecking] = useState(false)

  const isInactive = profile?.status === 'inactive'
  const fullName = profile?.full_name?.trim()
  const firstName = fullName?.split(/\s+/)[0]

  const checkAgain = async () => {
    setChecking(true)
    await queryClient.invalidateQueries({ queryKey: ['auth'] })
    await queryClient.refetchQueries({ queryKey: authKeys.session })
    await router.invalidate()
    setChecking(false)
  }

  return (
    <div className="relative isolate grid min-h-dvh place-items-center overflow-hidden bg-bg px-5 py-10">
      <div aria-hidden className="absolute left-1/2 top-1/3 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-rosa/15 blur-[120px]" />

      <div className="flex w-full max-w-md flex-col items-center gap-6">
        <Logo />
        <section className="flex w-full animate-fade-up flex-col items-center gap-4 rounded-3xl border border-line bg-surface p-6 text-center shadow-card sm:p-8">
          <Illustration name={isInactive ? 'bell' : 'ticket'} />
          {isInactive ? <Stamp tone="muted">Cuenta inactiva</Stamp> : <Stamp tone="dorado">En revisión</Stamp>}
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {isInactive ? 'Tu acceso está pausado' : firstName ? `${firstName}, ya casi entras` : 'Ya casi entras'}
          </h1>
          <p className="text-sm text-fg-muted">
            {isInactive
              ? 'Tu cuenta está desactivada. Si crees que es un error, habla con la academia.'
              : 'Recibimos tus datos. Apenas la academia apruebe tu cuenta podrás reservar clases. Te avisaremos.'}
          </p>

          <div className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface-2 p-3 text-left">
            <IconTile icon={Mail} tone={isInactive ? 'neutral' : 'ambar'} size="sm" />
            <div className="min-w-0">
              {fullName && <p className="truncate text-sm font-semibold">{fullName}</p>}
              <p className="truncate text-xs text-fg-muted">{profile?.email ?? 'Tu cuenta de Google'}</p>
            </div>
          </div>

          <div className="mt-2 flex w-full flex-col gap-3">
            <Button size="lg" onClick={checkAgain} loading={checking}>
              {!checking && <RefreshCw className="size-4" aria-hidden />}
              Ya me aprobaron
            </Button>
            <Button variant="ghost" onClick={() => signOut.mutate()}>
              <LogOut className="size-4" aria-hidden />
              Usar otra cuenta
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
