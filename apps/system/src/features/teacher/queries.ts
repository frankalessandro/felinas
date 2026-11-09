import { queryOptions } from '@tanstack/react-query'
import { getTeacherById, getTeacherByProfile, listActiveTeachers, listSessionNotes, listSessionRoster, listStudentBookings, listStudentNotes } from './api/teacher.api'
import { groupStudents } from './lib'

export const teacherKeys = {
  all: ['teacher'] as const,
  me: (profileId: string) => [...teacherKeys.all, 'me', profileId] as const,
  byId: (teacherId: string) => [...teacherKeys.all, 'by-id', teacherId] as const,
  roster: (sessionId: string) => [...teacherKeys.all, 'roster', sessionId] as const,
  sessionNotes: (sessionId: string) => [...teacherKeys.all, 'session-notes', sessionId] as const,
  students: (teacherId: string, fromIso: string) => [...teacherKeys.all, 'students', teacherId, fromIso] as const,
  studentNotes: (studentId: string) => [...teacherKeys.all, 'student-notes', studentId] as const,
}

export const currentTeacherQuery = (profileId: string) =>
  queryOptions({ queryKey: teacherKeys.me(profileId), queryFn: () => getTeacherByProfile(profileId), staleTime: 5 * 60_000 })

export const teacherByIdQuery = (teacherId: string) =>
  queryOptions({ queryKey: teacherKeys.byId(teacherId), queryFn: () => getTeacherById(teacherId), staleTime: 5 * 60_000 })

export const activeTeachersQuery = queryOptions({
  queryKey: [...teacherKeys.all, 'active-list'] as const,
  queryFn: listActiveTeachers,
  staleTime: 5 * 60_000,
})

export const rosterQuery = (sessionId: string) =>
  queryOptions({ queryKey: teacherKeys.roster(sessionId), queryFn: () => listSessionRoster(sessionId) })

export const sessionNotesQuery = (sessionId: string) =>
  queryOptions({ queryKey: teacherKeys.sessionNotes(sessionId), queryFn: () => listSessionNotes(sessionId) })

export const teacherStudentsQuery = (teacherId: string, fromIso: string) =>
  queryOptions({
    queryKey: teacherKeys.students(teacherId, fromIso),
    queryFn: async () => groupStudents(await listStudentBookings(teacherId, fromIso)),
  })

export const studentNotesQuery = (studentId: string) =>
  queryOptions({ queryKey: teacherKeys.studentNotes(studentId), queryFn: () => listStudentNotes(studentId) })
