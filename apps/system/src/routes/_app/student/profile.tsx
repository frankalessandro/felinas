import { createFileRoute } from '@tanstack/react-router'
import { ProfileScreen } from '@/features/profile/components/ProfileScreen'

export const Route = createFileRoute('/_app/student/profile')({
  component: ProfileScreen,
})
