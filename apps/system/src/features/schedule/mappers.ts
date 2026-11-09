import type { CalendarEvent } from '@/components/calendar'
import type { SessionWithDetails } from './types'

const FALLBACK_COLOR = '#ea1a62'

/** Traduce una sesión de la base al modelo de vista del calendario. Los extras (badge, disabled) los decide cada rol. */
export function toCalendarEvent(
  session: SessionWithDetails,
  extras: Pick<CalendarEvent, 'badge' | 'disabled'> = {},
): CalendarEvent {
  return {
    id: session.id,
    title: session.title ?? session.class_type?.name ?? 'Clase',
    startsAt: session.starts_at,
    endsAt: session.ends_at,
    color: session.class_type?.color ?? FALLBACK_COLOR,
    teacherName: session.teacher?.full_name ?? undefined,
    roomName: session.room?.name ?? undefined,
    booked: session.booked_count,
    capacity: session.capacity,
    waitlist: session.waitlist_count,
    status: session.status,
    kind: session.kind,
    ...extras,
  }
}
