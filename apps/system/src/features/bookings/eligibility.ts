import type { BadgeTone } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { isPlanActive } from '@/features/student-plan/plans'
import type { StudentPlan } from '@/features/student-plan/types'
import { getBusinessWeekStart, toDateKey } from '@/lib/dates'
import { getCategoryUsed } from './quota'
import type { BookingAttendance, BookingWithSession } from './types'

export type BookingAction = 'book' | 'waitlist' | 'booked' | 'waitlisted' | 'unavailable'

export type UnavailableReason =
  | 'SESSION_CANCELLED'
  | 'SESSION_STARTED'
  | 'SESSION_PRIVATE'
  | 'NO_ACTIVE_PLAN'
  | 'PLAN_EXPIRES_BEFORE'
  | 'CLASS_TYPE_NOT_COVERED'
  | 'PLAN_LIMIT_REACHED'
  | 'PLAN_FROZEN'
  | 'CATEGORY_QUOTA_REACHED'

type PlanBlock = 'PLAN_FROZEN' | 'PLAN_LIMIT_REACHED' | 'CATEGORY_QUOTA_REACHED'

/** Lo mínimo de una reserva que hace falta para decidir; `BookingWithSession` lo cumple. */
export type BookingLike = Pick<BookingWithSession, 'id' | 'session_id' | 'status' | 'student_plan_id' | 'waitlist_position'> & {
  session: Pick<SessionWithDetails, 'starts_at' | 'status' | 'class_type_id'>
  /** Solo hace falta para saber si la clase ya se consumió del plan (cupos por categoría). */
  attendance?: Pick<BookingAttendance, 'consumed'> | null
}

export interface BookingEligibility {
  action: BookingAction
  reason: UnavailableReason | null
  /** Texto del botón principal. */
  label: string
  /** Explicación para la hoja de detalle. */
  message: string | null
  badge: { label: string; tone: BadgeTone } | null
  /** Reserva activa de la alumna en esta sesión (para poder cancelarla). */
  booking: BookingLike | null
}

interface EligibilityInput {
  session: SessionWithDetails
  plans: StudentPlan[]
  /** Reservas activas de la alumna: futuras y de la semana de la sesión. Se admiten repetidas. */
  bookings: BookingLike[]
  now: Date
}

const REASON_COPY: Record<Exclude<UnavailableReason, 'CATEGORY_QUOTA_REACHED'>, { message: string; badge: { label: string; tone: BadgeTone } | null }> = {
  SESSION_CANCELLED: { message: 'Esta clase fue cancelada.', badge: null },
  SESSION_STARTED: { message: 'Esta clase ya empezó. Ya no se puede reservar.', badge: { label: 'Ya inició', tone: 'neutral' } },
  SESSION_PRIVATE: { message: 'Las clases personalizadas las agenda la academia.', badge: { label: 'Asignada por la academia', tone: 'dorado' } },
  NO_ACTIVE_PLAN: {
    message: 'No tienes un plan activo. Habla con la academia para que te asignen uno.',
    badge: { label: 'Sin plan activo', tone: 'warn' },
  },
  PLAN_EXPIRES_BEFORE: {
    message: 'Tu plan vence antes de esta clase. Renuévalo con la academia para reservarla.',
    badge: { label: 'Tu plan vence antes', tone: 'warn' },
  },
  CLASS_TYPE_NOT_COVERED: {
    message: 'Este estilo no está incluido en tu plan. Habla con la academia si quieres ampliarlo.',
    badge: { label: 'No incluida en tu plan', tone: 'neutral' },
  },
  PLAN_LIMIT_REACHED: {
    message: 'Ya alcanzaste el límite de tu plan para esta clase (clases del paquete o tope semanal).',
    badge: { label: 'Límite del plan alcanzado', tone: 'warn' },
  },
  PLAN_FROZEN: {
    message: 'Tu plan está congelado: no puedes reservar hasta que la academia lo reactive.',
    badge: { label: 'Plan congelado', tone: 'warn' },
  },
}

function unavailable(reason: UnavailableReason, categoryName?: string): BookingEligibility {
  if (reason === 'CATEGORY_QUOTA_REACHED') {
    const category = categoryName ?? 'esta categoría'
    return {
      action: 'unavailable',
      reason,
      label: 'No disponible',
      message: `Ya usaste todas las clases de ${category} que incluye tu plan este mes.`,
      badge: { label: categoryName ? `Cupo de ${categoryName} agotado` : 'Cupo de la categoría agotado', tone: 'warn' },
      booking: null,
    }
  }
  const { message, badge } = REASON_COPY[reason]
  return { action: 'unavailable', reason, label: 'No disponible', message, badge, booking: null }
}

function isSameWeek(a: string, b: string): boolean {
  return toDateKey(getBusinessWeekStart(new Date(a))) === toDateKey(getBusinessWeekStart(new Date(b)))
}

/** Un plan solo sirve si está vigente hoy y cubre el día de la clase. */
function isPlanValidOn(plan: StudentPlan, sessionDate: string): boolean {
  return plan.startsOn <= sessionDate && plan.expiresOn >= sessionDate
}

/** Misma regla que la base (`_plan_reason`): congelado, tope del plan (paquete o semana) y cupo de la categoría. */
function getPlanBlock(plan: StudentPlan, session: SessionWithDetails, bookings: BookingLike[], now: Date): PlanBlock | null {
  if (plan.isFrozen) return 'PLAN_FROZEN'
  const own = bookings.filter((b) => b.status === 'booked' && b.student_plan_id === plan.id && b.session.status === 'scheduled')

  if (plan.type === 'package') {
    const futureReserved = own.filter((b) => new Date(b.session.starts_at) > now && !b.attendance?.consumed).length
    if ((plan.classesRemaining ?? 0) - futureReserved <= 0) return 'PLAN_LIMIT_REACHED'
  } else if (plan.weeklyLimit !== null) {
    const inSameWeek = own.filter((b) => isSameWeek(b.session.starts_at, session.starts_at)).length
    if (inSameWeek >= plan.weeklyLimit) return 'PLAN_LIMIT_REACHED'
  }

  // Sin cupo definido para la categoría (o plan sin cupos) solo aplica el tope total.
  const categoryId = plan.classTypes.find((type) => type.id === session.class_type_id)?.categoryId
  const quota = categoryId ? plan.quotas.find((q) => q.categoryId === categoryId) : undefined
  if (quota && categoryId && getCategoryUsed(plan, categoryId, bookings, now) >= quota.max) return 'CATEGORY_QUOTA_REACHED'
  return null
}

function getQuotaCategoryName(plan: StudentPlan, session: SessionWithDetails): string | undefined {
  const categoryId = plan.classTypes.find((type) => type.id === session.class_type_id)?.categoryId
  return plan.quotas.find((q) => q.categoryId === categoryId)?.name
}

function findOwnBooking(session: SessionWithDetails, bookings: BookingLike[]): BookingLike | null {
  return bookings.find((b) => b.session_id === session.id && b.status !== 'cancelled') ?? null
}

function fromOwnBooking(booking: BookingLike): BookingEligibility {
  if (booking.status === 'waitlist') {
    const position = booking.waitlist_position
    return {
      action: 'waitlisted',
      reason: null,
      label: position ? `En espera #${position}` : 'En espera',
      message: 'Estás en la lista de espera. Si se libera un cupo, subes automáticamente y te avisamos.',
      badge: { label: position ? `En espera · #${position}` : 'En espera', tone: 'warn' },
      booking,
    }
  }
  return {
    action: 'booked',
    reason: null,
    label: 'Reservada',
    message: 'Tienes cupo en esta clase. Puedes cancelar gratis hasta que empiece.',
    badge: { label: 'Reservada', tone: 'ok' },
    booking,
  }
}

/** Por qué (o si) la alumna puede reservar una sesión. Pura: el servidor sigue siendo quien decide. */
export function getBookingEligibility({ session, plans, bookings, now }: EligibilityInput): BookingEligibility {
  const own = findOwnBooking(session, bookings)
  if (own) return fromOwnBooking(own)

  if (session.status === 'cancelled') return unavailable('SESSION_CANCELLED')
  if (session.kind === 'private') return unavailable('SESSION_PRIVATE')
  if (new Date(session.starts_at) <= now) return unavailable('SESSION_STARTED')

  const groupPlans = plans.filter((plan) => !plan.isPrivate && isPlanActive(plan))
  if (groupPlans.length === 0) return unavailable('NO_ACTIVE_PLAN')

  const sessionDate = toDateKey(session.starts_at)
  const validOnDate = groupPlans.filter((plan) => isPlanValidOn(plan, sessionDate))
  if (validOnDate.length === 0) return unavailable('PLAN_EXPIRES_BEFORE')

  const covering = validOnDate.filter((plan) => plan.classTypes.some((type) => type.id === session.class_type_id))
  if (covering.length === 0) return unavailable('CLASS_TYPE_NOT_COVERED')

  const blocks = covering.map((plan) => ({ plan, block: getPlanBlock(plan, session, bookings, now) }))
  if (!blocks.some(({ block }) => block === null)) {
    // Igual que la base: se informa el motivo del primer plan candidato.
    const first = blocks[0]
    if (first?.block) return unavailable(first.block, first.block === 'CATEGORY_QUOTA_REACHED' ? getQuotaCategoryName(first.plan, session) : undefined)
  }

  const isFull = session.booked_count >= session.capacity
  if (isFull) {
    return {
      action: 'waitlist',
      reason: null,
      label: 'Lista de espera',
      message: 'La clase está llena. Únete a la lista de espera: si alguien cancela, subes automáticamente.',
      badge: { label: 'Cupo lleno', tone: 'danger' },
      booking: null,
    }
  }
  return { action: 'book', reason: null, label: 'Reservar', message: null, badge: null, booking: null }
}

/** Quita repetidas (una reserva puede venir en la lista de la semana y en la de próximas). */
export function mergeBookings<T extends { id: string }>(...lists: T[][]): T[] {
  const byId = new Map<string, T>()
  for (const list of lists) for (const booking of list) byId.set(booking.id, booking)
  return [...byId.values()]
}

/** Reservas futuras (`booked`) por plan de alumna, para mostrar cuántas clases ya comprometió. */
export function countReservedByPlan(bookings: BookingLike[]): Map<string, number> {
  const counts = new Map<string, number>()
  for (const booking of bookings) {
    if (booking.status !== 'booked' || !booking.student_plan_id) continue
    counts.set(booking.student_plan_id, (counts.get(booking.student_plan_id) ?? 0) + 1)
  }
  return counts
}
