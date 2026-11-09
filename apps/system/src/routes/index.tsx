import { createFileRoute, redirect } from '@tanstack/react-router'
import { requireActiveUser } from '@/features/auth/guards'
import { ROLE_HOME } from '@/features/auth/roles'
import { getEffectiveRole, isDeveloper } from '@/features/dev/effectiveRole'
import { useDevViewStore } from '@/features/dev/store'

/** "/" solo reparte: cada rol tiene su propio inicio. El desarrollador sin vista elegida va al selector beta. */
export const Route = createFileRoute('/')({
  beforeLoad: async ({ context }) => {
    const { profile } = await requireActiveUser(context.queryClient)
    if (isDeveloper(profile) && useDevViewStore.getState().viewAs === null) throw redirect({ to: '/beta' })
    throw redirect({ to: ROLE_HOME[getEffectiveRole(profile)] })
  },
})
