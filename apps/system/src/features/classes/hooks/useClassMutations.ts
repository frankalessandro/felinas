import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toastError, toastSuccess } from '@/lib/mutationToasts'
import { archiveClassType, createClassType, setClassTypeActive, updateClassType } from '../api/classTypes.api'
import { createRoom, setRoomActive, updateRoom } from '../api/rooms.api'
import { createSchedule, setScheduleActive, updateSchedule } from '../api/schedules.api'
import { classKeys } from '../queries'
import type { ClassTypeFormData, RoomFormData, ScheduleFormData } from '../schemas'

const GENERATE_HINT = 'Genera las sesiones con «Generar semanas» en Agenda para que aparezcan en el calendario.'

// Los horarios se muestran también en la ficha de cada profe (feature teachers).
const TEACHERS_KEY = ['teachers'] as const

interface ToggleVariables {
  id: string
  active: boolean
}

export function useSaveClassType(classTypeId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClassTypeFormData) => (classTypeId ? updateClassType(classTypeId, data) : createClassType(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all })
      toastSuccess(classTypeId ? 'Estilo actualizado' : 'Estilo creado')
    },
    onError: toastError('No se pudo guardar el estilo'),
  })
}

export function useToggleClassType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: ToggleVariables) => setClassTypeActive(id, active),
    onSuccess: async (_, { active }) => {
      await queryClient.invalidateQueries({ queryKey: classKeys.types() })
      toastSuccess(active ? 'Estilo activado' : 'Estilo desactivado')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}

export function useArchiveClassType() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: archiveClassType,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.all })
      toastSuccess('Estilo archivado')
    },
    onError: toastError('No se pudo archivar el estilo'),
  })
}

export function useSaveRoom(roomId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: RoomFormData) => (roomId ? updateRoom(roomId, data) : createRoom(data)),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: classKeys.rooms() })
      toastSuccess(roomId ? 'Salón actualizado' : 'Salón creado')
    },
    onError: toastError('No se pudo guardar el salón'),
  })
}

export function useToggleRoom() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: ToggleVariables) => setRoomActive(id, active),
    onSuccess: async (_, { active }) => {
      await queryClient.invalidateQueries({ queryKey: classKeys.rooms() })
      toastSuccess(active ? 'Salón activado' : 'Salón desactivado')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}

export function useSaveSchedule(scheduleId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ScheduleFormData) => (scheduleId ? updateSchedule(scheduleId, data) : createSchedule(data)),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: classKeys.schedules() }),
        queryClient.invalidateQueries({ queryKey: TEACHERS_KEY }),
      ])
      toastSuccess(scheduleId ? 'Horario actualizado' : 'Horario creado', GENERATE_HINT)
    },
    onError: toastError('No se pudo guardar el horario'),
  })
}

export function useToggleSchedule() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }: ToggleVariables) => setScheduleActive(id, active),
    onSuccess: async (_, { active }) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: classKeys.schedules() }),
        queryClient.invalidateQueries({ queryKey: TEACHERS_KEY }),
      ])
      toastSuccess(active ? 'Horario activado' : 'Horario pausado')
    },
    onError: toastError('No se pudo cambiar el estado'),
  })
}
