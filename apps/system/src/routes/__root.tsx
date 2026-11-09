import type { QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { Toaster } from 'sileo'
import { useAuthListener } from '@/features/auth/hooks/useAuthListener'
import { LocalUserSwitcher } from '@/features/dev/components/LocalUserSwitcher'

interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
})

function RootLayout() {
  useAuthListener()
  return (
    <>
      <Outlet />
      <LocalUserSwitcher />
      <Toaster position="top-center" theme="dark" />
    </>
  )
}
