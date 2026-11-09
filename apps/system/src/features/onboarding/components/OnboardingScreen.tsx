import { getRouteApi } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { Logo } from '@/components/layout/Logo'
import { Button } from '@/components/ui'
import { useSignOut } from '@/features/auth/hooks/useAuth'
import { OnboardingForm } from './OnboardingForm'

const route = getRouteApi('/onboarding')

function readGoogleName(metadata: Record<string, unknown>): string {
  const name = metadata.full_name ?? metadata.name
  return typeof name === 'string' ? name : ''
}

/** Primer ingreso: una tarjeta limpia con el formulario de datos y permisos. */
export function OnboardingScreen() {
  const { session, profile } = route.useRouteContext()
  const signOut = useSignOut()
  const initialName = profile?.full_name ?? readGoogleName(session.user.user_metadata)

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-bg">
      <div aria-hidden className="absolute -top-32 left-1/2 -z-10 size-[30rem] -translate-x-1/2 rounded-full bg-rosa/15 blur-[120px]" />

      <div className="mx-auto flex min-h-dvh w-full max-w-xl flex-col px-5 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-6 sm:px-8">
        <header className="flex items-center justify-between">
          <Logo />
          <Button variant="ghost" onClick={() => signOut.mutate()} disabled={signOut.isPending}>
            <LogOut className="size-4" aria-hidden />
            Salir
          </Button>
        </header>

        <main className="mt-8 flex flex-1 animate-fade-up flex-col gap-6">
          <div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              Te damos la bienvenida a <span className="text-gradient-felinas">Felinas</span>
            </h1>
            <p className="mt-2 text-sm text-fg-muted">
              Cuéntanos quién eres para dejar tu cuenta lista. Son 30 segundos y solo lo pedimos una vez.
            </p>
          </div>

          <div className="rounded-3xl border border-line bg-surface p-5 shadow-card sm:p-7">
            <OnboardingForm initialName={initialName} />
          </div>
        </main>
      </div>
    </div>
  )
}
