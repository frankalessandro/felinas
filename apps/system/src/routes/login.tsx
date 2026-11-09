import { createFileRoute, redirect } from '@tanstack/react-router'
import { sessionQuery } from '@/features/auth/queries'
import { LoginScreen } from '@/features/auth/components/LoginScreen'

export const Route = createFileRoute('/login')({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(sessionQuery)
    if (session) throw redirect({ to: '/' })
  },
  component: LoginScreen,
})
