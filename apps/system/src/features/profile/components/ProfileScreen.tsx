import { Mail, UserRound } from 'lucide-react'
import { Avatar, PageHeader } from '@/components/ui'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { ProfileForm } from './ProfileForm'

/** Tarjeta de perfil: avatar, nombre y correo con un halo suave de marca. */
function IdentityCard({ name, email }: { name: string; email: string | null }) {
  return (
    <section
      aria-label="Tu perfil"
      className="relative isolate flex items-center gap-4 overflow-hidden rounded-3xl border border-line bg-surface p-5 shadow-card"
    >
      <div aria-hidden className="absolute -right-10 -top-16 -z-10 size-56 rounded-full bg-rosa/15 blur-[80px]" />
      <span className="rounded-full bg-gradient-felinas p-[3px]">
        <span className="block rounded-full bg-surface p-1">
          <Avatar name={name} size="xl" />
        </span>
      </span>
      <div className="flex min-w-0 flex-col gap-1">
        <p className="break-words font-display text-xl font-bold leading-tight">{name}</p>
        {email && (
          <p className="flex items-center gap-1.5 break-all text-sm text-fg-muted">
            <Mail className="size-4 shrink-0" aria-hidden />
            {email}
          </p>
        )}
      </div>
    </section>
  )
}

export function ProfileScreen() {
  const profile = useCurrentProfile()
  const displayName = profile.full_name?.trim() || profile.email?.split('@')[0] || 'Alumna'
  return (
    <div className="flex max-w-2xl animate-fade-up flex-col gap-6">
      <PageHeader
        icon={UserRound}
        iconTone="violeta"
        title="Mi perfil"
        description="Mantén tu celular al día para que la academia pueda escribirte."
      />
      <IdentityCard name={displayName} email={profile.email} />
      <ProfileForm key={profile.updated_at} profile={profile} />
    </div>
  )
}
