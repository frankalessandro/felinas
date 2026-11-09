import { createFileRoute } from '@tanstack/react-router'
import { PlanScreen } from '@/features/student-plan/components/PlanScreen'

export const Route = createFileRoute('/_app/student/plan')({
  component: PlanScreen,
})
