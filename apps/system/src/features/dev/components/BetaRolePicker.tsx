import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, GraduationCap, type LucideIcon, ShieldCheck, UserRound } from 'lucide-react'
import { IconTile, Stamp, type Tone } from '@/components/brand'
import { Logo } from '@/components/layout/Logo'
import { Button, Label, Select } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { ROLE_HOME, ROLE_LABEL } from '@/features/auth/roles'
import type { UserRole } from '@/features/auth/types'
import { activeTeachersQuery } from '@/features/teacher/queries'
import { cn } from '@/lib/cn'
import { useEffectiveRole } from '../effectiveRole'
import { useDevViewStore } from '../store'

interface RoleCardConfig {
  role: UserRole
  title: string
  description: string
  icon: LucideIcon
  tone: Tone
}

const ROLE_CARDS: RoleCardConfig[] = [
  {
    role: 'admin',
    title: 'Admin',
    description: 'Lo que ve Mae: agenda, asistencia, alumnas, planes, membresías y reportes.',
    icon: ShieldCheck,
    tone: 'rosa',
  },
  {
    role: 'teacher',
    title: 'Profe',
    description: 'Agenda de un profe, quién reservó cada clase y notas de seguimiento.',
    icon: GraduationCap,
    tone: 'violeta',
  },
  {
    role: 'student',
    title: 'Alumna',
    description: 'Reservar clases, su plan, historial y notificaciones. Usa tu propia cuenta como alumna.',
    icon: UserRound,
    tone: 'ambar',
  },
]

/** Selector de vista para el desarrollador: una tarjeta por rol. */
export function BetaRolePicker() {
  const profile = useCurrentProfile()
  const effectiveRole = useEffectiveRole(profile)
  const { teacherId, setView } = useDevViewStore()
  const navigate = useNavigate()
  const teachers = useQuery(activeTeachersQuery)
  const [selectedTeacher, setSelectedTeacher] = useState<string>(teacherId ?? '')

  function enter(role: UserRole) {
    setView(role, role === 'teacher' ? selectedTeacher : null)
    void navigate({ to: ROLE_HOME[role] })
  }

  return (
    <div className="relative isolate min-h-dvh overflow-hidden bg-bg px-4 py-8 sm:px-8 lg:py-14">
      <div aria-hidden className="absolute -right-32 -top-32 -z-10 size-[26rem] rounded-full bg-violeta/15 blur-[120px]" />
      <div aria-hidden className="absolute -bottom-40 -left-32 -z-10 size-[28rem] rounded-full bg-rosa/15 blur-[140px]" />

      <div className="mx-auto flex max-w-5xl animate-fade-up flex-col gap-8">
        <header className="flex flex-col gap-5">
          <Logo />
          <div className="flex flex-col items-start gap-3">
            <Stamp tone="dorado">Modo beta · solo desarrollador</Stamp>
            <h1 className="font-display text-2xl font-extrabold tracking-tight sm:text-3xl">
              ¿Con qué vista quieres <span className="text-gradient-felinas">entrar</span>?
            </h1>
            <p className="max-w-2xl text-sm text-fg-muted">
              Cambia de vista para probar la app como la verían Mae, un profe o una alumna. Solo cambia las pantallas: los
              permisos los sigue validando la base de datos.
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {ROLE_CARDS.map((card) => {
            const isCurrent = effectiveRole === card.role
            const needsTeacher = card.role === 'teacher'
            const disabled = needsTeacher && !selectedTeacher
            return (
              <article
                key={card.role}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border bg-surface p-5 shadow-card transition-colors hover:border-line-strong',
                  isCurrent ? 'border-rosa/60' : 'border-line',
                )}
              >
                <div className="flex items-start justify-between gap-3">
                  <IconTile icon={card.icon} tone={card.tone} size="lg" />
                  {isCurrent && <Stamp tone="rosa">Vista actual</Stamp>}
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold">{card.title}</h2>
                  <p className="mt-1 text-sm text-fg-muted">{card.description}</p>
                </div>

                {needsTeacher && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="beta-teacher">Ver como</Label>
                    <Select
                      id="beta-teacher"
                      value={selectedTeacher}
                      onValueChange={setSelectedTeacher}
                      placeholder={teachers.isLoading ? 'Cargando profes…' : 'Elige un profe'}
                      options={(teachers.data ?? []).map((teacher) => ({ value: teacher.id, label: teacher.full_name }))}
                    />
                  </div>
                )}

                <Button className="mt-auto" size="lg" disabled={disabled} onClick={() => enter(card.role)}>
                  Entrar como {ROLE_LABEL[card.role].toLowerCase()}
                  <ArrowRight className="size-4" aria-hidden />
                </Button>
              </article>
            )
          })}
        </div>
      </div>
    </div>
  )
}
