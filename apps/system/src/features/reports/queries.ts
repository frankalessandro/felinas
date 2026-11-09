import { queryOptions } from '@tanstack/react-query'
import {
  DEFAULT_AT_RISK_DAYS,
  DEFAULT_INACTIVE_DAYS,
  DEFAULT_RENEWAL_MONTHS,
  getOccupancyReport,
  getRenewalReport,
  listAtRiskStudents,
  listInactiveStudents,
} from './api/reports.api'
import type { DateRange } from './types'

export const reportKeys = {
  all: ['reports'] as const,
  occupancy: (range: DateRange) => [...reportKeys.all, 'occupancy', range] as const,
  inactive: (days: number) => [...reportKeys.all, 'inactive', days] as const,
  atRisk: (days: number) => [...reportKeys.all, 'at-risk', days] as const,
  renewal: (months: number) => [...reportKeys.all, 'renewal', months] as const,
}

export const occupancyReportQuery = (range: DateRange) =>
  queryOptions({
    queryKey: reportKeys.occupancy(range),
    queryFn: () => getOccupancyReport(range),
  })

export const inactiveStudentsQuery = (days = DEFAULT_INACTIVE_DAYS) =>
  queryOptions({
    queryKey: reportKeys.inactive(days),
    queryFn: () => listInactiveStudents(days),
  })

export const atRiskStudentsQuery = (days = DEFAULT_AT_RISK_DAYS) =>
  queryOptions({
    queryKey: reportKeys.atRisk(days),
    queryFn: () => listAtRiskStudents(days),
  })

export const renewalReportQuery = (months = DEFAULT_RENEWAL_MONTHS) =>
  queryOptions({
    queryKey: reportKeys.renewal(months),
    queryFn: () => getRenewalReport(months),
  })
