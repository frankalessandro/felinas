import { queryOptions } from '@tanstack/react-query'
import { searchStudents } from '@/features/students/api/searchStudents.api'
import { getSessionFormOptions, listSessionBookings, listStudentPlans } from './api/sessionsAdmin.api'

export const sessionAdminKeys = {
  all: ['sessions-admin'] as const,
  bookings: (sessionId: string) => [...sessionAdminKeys.all, 'bookings', sessionId] as const,
  options: () => [...sessionAdminKeys.all, 'options'] as const,
  students: (term: string) => [...sessionAdminKeys.all, 'students', term] as const,
  studentPlans: (studentId: string) => [...sessionAdminKeys.all, 'student-plans', studentId] as const,
}

export const sessionBookingsQuery = (sessionId: string) =>
  queryOptions({
    queryKey: sessionAdminKeys.bookings(sessionId),
    queryFn: () => listSessionBookings(sessionId),
  })

export const sessionFormOptionsQuery = () =>
  queryOptions({
    queryKey: sessionAdminKeys.options(),
    queryFn: getSessionFormOptions,
    staleTime: 5 * 60_000,
  })

export const studentPlansQuery = (studentId: string) =>
  queryOptions({
    queryKey: sessionAdminKeys.studentPlans(studentId),
    queryFn: () => listStudentPlans(studentId),
  })

export const studentSearchQuery = (term: string) =>
  queryOptions({
    queryKey: sessionAdminKeys.students(term),
    queryFn: () => searchStudents(term),
  })
