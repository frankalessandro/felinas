import { queryOptions } from '@tanstack/react-query'
import { countPendingUsers, getCollectedTotal, getOutstandingBalance, listExpiringPlans } from './api/dashboard.api'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  pendingUsers: () => [...dashboardKeys.all, 'pending-users'] as const,
  expiringPlans: () => [...dashboardKeys.all, 'expiring-plans'] as const,
  collected: (from: string, to: string) => [...dashboardKeys.all, 'collected', from, to] as const,
  outstanding: () => [...dashboardKeys.all, 'outstanding'] as const,
}

export const pendingUsersCountQuery = () =>
  queryOptions({
    queryKey: dashboardKeys.pendingUsers(),
    queryFn: countPendingUsers,
  })

export const expiringPlansQuery = () =>
  queryOptions({
    queryKey: dashboardKeys.expiringPlans(),
    queryFn: listExpiringPlans,
  })

export const collectedQuery = (range: { from: string; to: string }) =>
  queryOptions({
    queryKey: dashboardKeys.collected(range.from, range.to),
    queryFn: () => getCollectedTotal(range),
  })

export const outstandingBalanceQuery = () =>
  queryOptions({
    queryKey: dashboardKeys.outstanding(),
    queryFn: getOutstandingBalance,
  })
