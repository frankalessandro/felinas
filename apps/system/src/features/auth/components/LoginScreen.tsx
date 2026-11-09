import { CalendarCheck, Loader2, TicketCheck, TrendingUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { IconTile, type Tone } from '@/components/brand'
import { Illustration } from '@/components/illustrations/Illustration'
import { Logo } from '@/components/layout/Logo'
import { useGoogleSignIn } from '../hooks/useAuth'
import { GoogleIcon } from './GoogleIcon'

interface Feature {
  icon: LucideIcon
  tone: Tone
  title: string
  body: string
}

const FEATURES: Feature[] = [
  { icon: CalendarCheck, tone: 'rosa', title: 'Reserva en segundos', body: 'Mira la agenda y aparta tu cupo desde el celular.' },
  { icon: TicketCheck, tone: 'violeta', title: 'Tu plan al día', body: 'Clases restantes, vencimiento y pagos en un solo lugar.' },
  { icon: TrendingUp, tone: 'ambar', title: 'Sigue tu progreso', body: 'Historial de asistencia y notas de tus profes.' },
]

/** Acceso: panel de marca a la izquierda y tarjeta de ingreso a la derecha; apilado en móvil. */
export function LoginScreen() {
  const signIn = useGoogleSignIn()

  return (
    <div className="grid min-h-dvh bg-bg lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative isolate hidden flex-col justify-between overflow-hidden border-r border-line bg-surface p-12 lg:flex">
        <div aria-hidden className="absolute -left-32 -top-32 -z-10 size-[30rem] rounded-full bg-rosa/20 blur-[120px]" />
        <div aria-hidden className="absolute -bottom-40 -right-24 -z-10 size-[28rem] rounded-full bg-violeta/25 blur-[130px]" />
        <Illustration name="dance" className="absolute -bottom-6 -right-6 -z-10 h-72 opacity-40" />
        <Logo />
        <div className="max-w-md">
          <h1 className="font-display text-4xl font-extrabold leading-tight tracking-tight">
            Tus clases, tu plan y tu ritmo, en <span className="text-gradient-felinas">un solo lugar</span>
          </h1>
          <p className="mt-4 text-fg-muted">
            Academia Pantera Felinas. Gestiona tu agenda sin escribir mensajes ni buscar hojas de cálculo.
          </p>
          <ul className="mt-9 flex flex-col gap-5">
            {FEATURES.map((feature) => (
              <li key={feature.title} className="flex items-start gap-4">
                <IconTile icon={feature.icon} tone={feature.tone} />
                <div>
                  <p className="font-display text-sm font-bold">{feature.title}</p>
                  <p className="text-sm text-fg-muted">{feature.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-fg-subtle">Palmira, Colombia</p>
      </aside>

      <main className="relative isolate flex flex-col items-center justify-center px-5 py-10 sm:px-10">
        <div aria-hidden className="absolute -top-24 left-1/2 -z-10 size-80 -translate-x-1/2 rounded-full bg-rosa/15 blur-[110px] lg:hidden" />
        <Logo className="mb-8 lg:hidden" />
        <section
          aria-labelledby="login-title"
          className="w-full max-w-sm animate-fade-up rounded-3xl border border-line bg-surface p-6 shadow-card sm:p-8"
        >
          <h2 id="login-title" className="font-display text-2xl font-extrabold tracking-tight">
            Te damos la bienvenida
          </h2>
          <p className="mt-2 text-sm text-fg-muted">
            Ingresa con tu cuenta de Google. Si es tu primera vez, la academia aprobará tu acceso.
          </p>

          <button
            type="button"
            onClick={() => signIn.mutate()}
            disabled={signIn.isPending}
            className="mt-7 flex min-h-12 w-full items-center justify-center gap-3 rounded-xl bg-fg font-display text-sm font-bold text-bg transition hover:bg-white active:scale-[.98] disabled:cursor-wait disabled:opacity-70"
          >
            {signIn.isPending ? <Loader2 className="size-5 animate-spin" aria-hidden /> : <GoogleIcon className="size-5" />}
            {signIn.isPending ? 'Conectando…' : 'Continuar con Google'}
          </button>

          <p className="mt-5 text-center text-xs text-fg-subtle">¿Problemas para entrar? Escríbele a la academia.</p>
        </section>
      </main>
    </div>
  )
}
