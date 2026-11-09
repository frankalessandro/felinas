import type { Tables } from '@/types/database'

export interface ExpiringPlan {
  studentPlanId: string
  planName: string
  classesRemaining: number | null
  daysToExpire: number | null
  expiresOn: string
  student: Pick<Tables<'profiles'>, 'id' | 'full_name' | 'phone' | 'avatar_url'>
}
