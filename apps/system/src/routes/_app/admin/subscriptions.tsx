import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { SubscriptionsPage } from '@/features/subscriptions/components/SubscriptionsPage'
import { currentMonthKey, MONTH_KEY_PATTERN } from '@/features/subscriptions/months'
import { SUBSCRIPTION_BUCKETS } from '@/features/subscriptions/types'

const searchSchema = z.object({
  month: z.string().regex(MONTH_KEY_PATTERN).optional().catch(undefined),
  bucket: z.enum(['all', ...SUBSCRIPTION_BUCKETS]).optional().catch(undefined),
  q: z.string().optional().catch(undefined),
  view: z.enum(['board', 'income']).optional().catch(undefined),
})

export const Route = createFileRoute('/_app/admin/subscriptions')({
  validateSearch: searchSchema,
  component: SubscriptionsRoute,
})

function SubscriptionsRoute() {
  const { month = currentMonthKey(), bucket = 'all', q = '', view = 'board' } = Route.useSearch()
  const navigate = Route.useNavigate()
  return (
    <SubscriptionsPage
      month={month}
      bucket={bucket}
      q={q}
      view={view}
      onMonthChange={(next) => navigate({ search: (prev) => ({ ...prev, month: next }), replace: true })}
      onBucketChange={(next) => navigate({ search: (prev) => ({ ...prev, bucket: next }), replace: true })}
      onQueryChange={(next) => navigate({ search: (prev) => ({ ...prev, q: next || undefined }), replace: true })}
      onViewChange={(next) => navigate({ search: (prev) => ({ ...prev, view: next }), replace: true })}
    />
  )
}
