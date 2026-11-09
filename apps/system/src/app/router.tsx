import { createRouter } from '@tanstack/react-router'
import { queryClient } from '@/lib/queryClient'
import { routeTree } from '@/routeTree.gen'
import { FullScreenLoader } from '@/components/layout/FullScreenLoader'
import { RouteError } from '@/components/layout/RouteError'
import { NotFound } from '@/components/layout/NotFound'

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  // TanStack Query ya cachea; que el router no guarde su propia copia.
  defaultPreloadStaleTime: 0,
  defaultPendingComponent: FullScreenLoader,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: NotFound,
  scrollRestoration: true,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
