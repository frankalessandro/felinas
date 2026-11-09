import { useMutation, useQueryClient } from '@tanstack/react-query'
import { sileo } from 'sileo'
import { getErrorMessage } from '@/lib/errors'
import { markAttendance } from '../api/attendance.api'
import { attendanceKeys, rosterQuery } from '../queries'
import type { AttendanceStatus, RosterEntry } from '../types'

/** Solo «Asistió» consume una clase: el saldo se ajusta al instante al entrar o salir de ese estado. */
function applyMark(entry: RosterEntry, status: AttendanceStatus): RosterEntry {
  const delta = (status === 'present' ? 1 : 0) - (entry.status === 'present' ? 1 : 0)
  if (delta === 0 || !entry.plan || entry.plan.classesRemaining === null) return { ...entry, status }
  return { ...entry, status, plan: { ...entry.plan, classesRemaining: entry.plan.classesRemaining - delta } }
}

interface MarkInput {
  bookingId: string
  status: AttendanceStatus
}

/** Marca asistencia con UI optimista: el botón responde al instante y se revierte si la base rechaza. */
export function useMarkAttendance(sessionId: string) {
  const queryClient = useQueryClient()
  const rosterKey = rosterQuery(sessionId).queryKey

  return useMutation({
    mutationFn: (input: MarkInput) => markAttendance(input),
    onMutate: async ({ bookingId, status }) => {
      await queryClient.cancelQueries({ queryKey: rosterKey })
      const previous = queryClient.getQueryData<RosterEntry[]>(rosterKey)
      queryClient.setQueryData<RosterEntry[]>(rosterKey, (entries) =>
        entries?.map((entry) => (entry.bookingId === bookingId ? applyMark(entry, status) : entry)),
      )
      return { previous }
    },
    onError: (error, _input, context) => {
      queryClient.setQueryData(rosterKey, context?.previous)
      sileo.error({ title: 'No se pudo marcar la asistencia', description: getErrorMessage(error) })
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: attendanceKeys.all }),
  })
}
