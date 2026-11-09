import { useQuery } from '@tanstack/react-query'
import { subDays } from 'date-fns'
import { academyToday } from '@/lib/dates'
import { studentNotesQuery, teacherStudentsQuery } from '../queries'
import { STUDENTS_WINDOW_DAYS } from '../lib'

export function useTeacherStudents(teacherId: string) {
  const fromIso = subDays(academyToday(), STUDENTS_WINDOW_DAYS).toISOString()
  return useQuery(teacherStudentsQuery(teacherId, fromIso))
}

export const useStudentNotes = (studentId: string) => useQuery(studentNotesQuery(studentId))
