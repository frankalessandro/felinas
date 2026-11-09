import { queryOptions } from '@tanstack/react-query'
import { listStudentPlans } from './api/studentPlans.api'

export const studentPlanKeys = {
  all: ['student-plans'] as const,
  mine: (studentId: string) => [...studentPlanKeys.all, studentId] as const,
}

export const studentPlansQuery = (studentId: string) =>
  queryOptions({
    queryKey: studentPlanKeys.mine(studentId),
    queryFn: () => listStudentPlans(studentId),
  })
