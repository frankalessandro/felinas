export type CalendarBadgeTone = 'ok' | 'warn' | 'danger' | 'rosa' | 'dorado' | 'neutral'

export interface CalendarEvent {
  id: string
  /** Nombre del tipo de clase o título personalizado. */
  title: string
  /** ISO UTC. */
  startsAt: string
  endsAt: string
  /** Hex del tipo de clase. */
  color: string
  teacherName?: string
  roomName?: string
  booked: number
  capacity: number
  waitlist?: number
  status: 'scheduled' | 'cancelled'
  kind: 'group' | 'private'
  /** Ej.: "Reservada", "En espera", "No incluida en tu plan". */
  badge?: { label: string; tone: CalendarBadgeTone }
  /** Ej.: no permitida por el plan: se muestra atenuada. */
  disabled?: boolean
}

export interface HourRange {
  startHour: number
  endHour: number
}

export interface PositionedEvent {
  event: CalendarEvent
  /** Posición vertical como % del rango visible. */
  topPct: number
  heightPct: number
  /** Columna dentro del grupo de eventos solapados y total de columnas del grupo. */
  column: number
  columns: number
}

/** Evento de la academia (show, batalla, obra): no es una clase, no tiene cupo ni reserva. */
export interface CalendarHighlight {
  id: string
  title: string
  /** Ej.: el lugar. */
  subtitle?: string
  /** `yyyy-MM-dd`, hora de la academia. */
  date: string
  /** Texto ya formateado, ej. "7:00 PM". Sin él el evento es de todo el día u hora por confirmar. */
  time?: string
  /** Hex del acento (dorado por defecto en la base). */
  color: string
  /** Ej.: "Evento gratuito". */
  badge?: string
}
