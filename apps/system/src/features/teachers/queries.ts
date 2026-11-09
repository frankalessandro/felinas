import { queryOptions } from '@tanstack/react-query'
import { countUpcomingSessions, listTeachers } from './api/teachers.api'

export const teacherKeys = {
  all: ['teachers'] as const,
  list: () => [...teacherKeys.all, 'list'] as const,
  upcoming: (id: string) => [...teacherKeys.all, 'upcoming', id] as const,
}

export const teachersQuery = () => queryOptions({ queryKey: teacherKeys.list(), queryFn: listTeachers })

export const upcomingSessionsCountQuery = (teacherId: string) =>
  queryOptions({ queryKey: teacherKeys.upcoming(teacherId), queryFn: () => countUpcomingSessions(teacherId) })
