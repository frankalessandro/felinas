import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { getErrorMessage } from '@/lib/errors'
import { createNote } from '../api/teacher.api'
import { teacherKeys } from '../queries'

export function useCreateNote() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createNote,
    onSuccess: (note) => {
      sileo.success({ title: 'Nota guardada' })
      void queryClient.invalidateQueries({ queryKey: teacherKeys.studentNotes(note.student_id) })
      if (note.session_id) void queryClient.invalidateQueries({ queryKey: teacherKeys.sessionNotes(note.session_id) })
    },
    onError: (error) => sileo.error({ title: 'No pudimos guardar la nota', description: getErrorMessage(error) }),
  })
}
