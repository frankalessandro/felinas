import type { ReactNode } from 'react'
import { useCurrentProfile } from '@/features/auth/hooks/useAuth'
import { DevBar } from '@/features/dev/components/DevBar'
import { useEffectiveRole } from '@/features/dev/effectiveRole'
import { NAVIGATION } from './navigation'
import { MobileDock } from './shell/MobileDock'
import { SideRail } from './shell/SideRail'
import { TopBar } from './shell/TopBar'

export function AppShell({ children }: { children: ReactNode }) {
  const profile = useCurrentProfile()
  const items = NAVIGATION[useEffectiveRole(profile)]

  return (
    <div className="relative flex min-h-dvh bg-bg">
      {/* Un solo halo de marca, muy sutil, detrás del contenido. */}
      <div aria-hidden className="pointer-events-none fixed inset-0 bg-claws" />
      <SideRail items={items} />
      <div className="relative z-10 flex min-w-0 flex-1 flex-col">
        <DevBar profile={profile} />
        <TopBar items={items} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-32 pt-6 sm:px-6 lg:px-10 lg:pb-12 lg:pt-8">{children}</main>
      </div>
      <MobileDock items={items} />
    </div>
  )
}
