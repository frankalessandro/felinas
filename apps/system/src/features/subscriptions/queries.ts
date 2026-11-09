import { queryOptions } from '@tanstack/react-query'
import { getMonthRevenue, getOutstandingBalance, getStudentPlanRow, getSubscriptionsOverview } from './api/subscriptions.api'
import type { MonthKey } from './months'

export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  overview: (month: MonthKey) => [...subscriptionKeys.all, 'overview', month] as const,
  revenue: (month: MonthKey) => [...subscriptionKeys.all, 'revenue', month] as const,
  outstanding: () => [...subscriptionKeys.all, 'outstanding'] as const,
  planRow: (studentPlanId: string) => [...subscriptionKeys.all, 'plan-row', studentPlanId] as const,
}

export const subscriptionsOverviewQuery = (month: MonthKey) =>
  queryOptions({ queryKey: subscriptionKeys.overview(month), queryFn: () => getSubscriptionsOverview(month) })

export const monthRevenueQuery = (month: MonthKey) =>
  queryOptions({ queryKey: subscriptionKeys.revenue(month), queryFn: () => getMonthRevenue(month) })

export const outstandingBalanceQuery = () =>
  queryOptions({ queryKey: subscriptionKeys.outstanding(), queryFn: getOutstandingBalance })

export const studentPlanRowQuery = (studentPlanId: string) =>
  queryOptions({ queryKey: subscriptionKeys.planRow(studentPlanId), queryFn: () => getStudentPlanRow(studentPlanId) })
