import type { Plan } from './types'

export type PlanKind = 'membership' | 'single' | 'private'

/** Un plan de una sola clase que no es personalizada es una clase suelta. */
export function getPlanKind(plan: Pick<Plan, 'is_private' | 'type' | 'class_count'>): PlanKind {
  if (plan.is_private) return 'private'
  if (plan.type === 'package' && plan.class_count === 1) return 'single'
  return 'membership'
}

export const PLAN_KIND_COPY: Record<PlanKind, { tab: string; label: string; how: string[] }> = {
  membership: {
    tab: 'Membresías',
    label: 'Membresía',
    how: [
      'La alumna se registra con Google y queda pendiente.',
      'Apruébala en Usuarios y asígnale la membresía del mes.',
      'Ella reserva sus clases; tú marcas la asistencia y se descuenta.',
    ],
  },
  single: {
    tab: 'Clases sueltas',
    label: 'Clase suelta',
    how: [
      'Quien llega a una clase suelta también se registra con Google y queda pendiente.',
      'Apruébala en Usuarios y asígnale «Clase suelta» (1 clase, vence a fin de mes).',
      'Ella reserva el cupo, o tú la metes desde la agenda. Se descuenta al marcar asistencia.',
    ],
  },
  private: {
    label: 'Personalizada',
    tab: 'Personalizadas',
    how: [
      'Asígnale a la alumna el plan personalizado (Shake o Jiggle) con su cupo de sesiones.',
      'En Agenda crea la sesión personalizada: elige alumna, profe y hora. No la reserva ella.',
      'Se descuenta una sesión del plan al marcar asistencia.',
    ],
  },
}
