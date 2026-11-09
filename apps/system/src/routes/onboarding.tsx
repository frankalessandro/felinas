import { createFileRoute, redirect } from '@tanstack/react-router'
import { needsOnboarding, requireSessionAnyState } from '@/features/auth/guards'
import { OnboardingScreen } from '@/features/onboarding/components/OnboardingScreen'

/** Primer ingreso de cualquier rol. Quien ya lo completó vuelve a "/". */
export const Route = createFileRoute('/onboarding')({
  beforeLoad: async ({ context }) => {
    const { session, profile } = await requireSessionAnyState(context.queryClient)
    if (profile && !needsOnboarding(profile)) throw redirect({ to: '/' })
    return { session, profile }
  },
  component: OnboardingScreen,
})
