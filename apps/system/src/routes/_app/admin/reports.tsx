import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'
import { ReportsPage } from '@/features/reports/components/ReportsPage'
import { occupancyReportQuery } from '@/features/reports/queries'
import { getDefaultRange } from '@/features/reports/range'

const dateKey = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

const searchSchema = z.object({
  from: dateKey.catch(() => getDefaultRange().from),
  to: dateKey.catch(() => getDefaultRange().to),
  tab: z.enum(['occupancy', 'students', 'renewal']).catch('occupancy'),
})

export const Route = createFileRoute('/_app/admin/reports')({
  validateSearch: (search) => searchSchema.parse(search),
  loaderDeps: ({ search }) => ({ from: search.from, to: search.to }),
  loader: ({ context, deps }) => context.queryClient.ensureQueryData(occupancyReportQuery(deps)),
  component: ReportsPage,
})
