import { queryOptions } from '@tanstack/react-query'
import { getAdminNotes, listProgressNotes, listStudentBookings } from './api/studentHistory.api'
import { listStudentPlanDetails, listStudentPlans } from './api/studentPlans.api'
import { getStudent, listStudents } from './api/students.api'

export const studentKeys = {
  all: ['students'] as const,
  list: () => [...studentKeys.all, 'list'] as const,
  detail: (id: string) => [...studentKeys.all, 'detail', id] as const,
  plans: (id: string) => [...studentKeys.all, 'plans', id] as const,
  planDetails: (id: string) => [...studentKeys.all, 'plan-details', id] as const,
  bookings: (id: string) => [...studentKeys.all, 'bookings', id] as const,
  progress: (id: string) => [...studentKeys.all, 'progress', id] as const,
  adminNotes: (id: string) => [...studentKeys.all, 'admin-notes', id] as const,
}

export const studentsQuery = () => queryOptions({ queryKey: studentKeys.list(), queryFn: listStudents })
export const studentQuery = (id: string) => queryOptions({ queryKey: studentKeys.detail(id), queryFn: () => getStudent(id) })
export const studentPlansQuery = (id: string) => queryOptions({ queryKey: studentKeys.plans(id), queryFn: () => listStudentPlans(id) })
export const studentPlanDetailsQuery = (id: string) =>
  queryOptions({ queryKey: studentKeys.planDetails(id), queryFn: () => listStudentPlanDetails(id) })
export const studentBookingsQuery = (id: string) => queryOptions({ queryKey: studentKeys.bookings(id), queryFn: () => listStudentBookings(id) })
export const progressNotesQuery = (id: string) => queryOptions({ queryKey: studentKeys.progress(id), queryFn: () => listProgressNotes(id) })
export const adminNotesQuery = (id: string) => queryOptions({ queryKey: studentKeys.adminNotes(id), queryFn: () => getAdminNotes(id) })
