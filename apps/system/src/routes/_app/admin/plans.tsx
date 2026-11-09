import { createFileRoute } from '@tanstack/react-router'
import { PlansPage } from '@/features/plans/components/PlansPage'

export const Route = createFileRoute('/_app/admin/plans')({
  component: PlansPage,
})
