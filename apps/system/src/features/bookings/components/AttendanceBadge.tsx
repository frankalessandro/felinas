import { Stamp } from '@/components/brand'
import { ATTENDANCE_DISPLAY, ATTENDANCE_PENDING } from '../labels'
import type { BookingAttendance } from '../types'

/** Estado de asistencia como etiqueta con punto de color. */
export function AttendanceBadge({ attendance }: { attendance: BookingAttendance | null }) {
  const display = attendance ? ATTENDANCE_DISPLAY[attendance.status] : ATTENDANCE_PENDING
  return (
    <Stamp tone={display.tone === 'neutral' ? 'muted' : display.tone}>
      {display.label}
    </Stamp>
  )
}
