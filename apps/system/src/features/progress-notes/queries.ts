import { queryOptions } from '@tanstack/react-query'
import { listProgressNotes } from './api/progressNotes.api'

export const progressNoteKeys = {
  all: ['progress-notes'] as const,
  forStudent: (studentId: string) => [...progressNoteKeys.all, studentId] as const,
}

export const progressNotesQuery = (studentId: string) =>
  queryOptions({
    queryKey: progressNoteKeys.forStudent(studentId),
    queryFn: () => listProgressNotes(studentId),
  })
