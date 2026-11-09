import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { createTeacher, setTeacherActive, updateTeacher } from '../api/teachers.api'
import { teacherKeys } from '../queries'
import type { TeacherFormData } from '../schemas'

export function useSaveTeacher(teacherId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: TeacherFormData) => (teacherId ? updateTeacher(teacherId, data) : createTeacher(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      toastSuccess(teacherId ? 'Profe actualizada' : 'Profe creada')
    },
    onError: toastError('No se pudo guardar la profe'),
  })
}

export function useToggleTeacher() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) => setTeacherActive(id, active),
    onSuccess: async (_, { active }) => {
      await queryClient.invalidateQueries({ queryKey: teacherKeys.all })
      toastSuccess(active ? 'Profe reactivada' : 'Profe desactivada')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}
