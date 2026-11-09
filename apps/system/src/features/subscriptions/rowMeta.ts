import type { BadgeTone } from '@/components/ui'
import { daysUntil } from '@/lib/dates'
import type { SubscriptionBucket, SubscriptionRow } from './types'

interface BucketMeta {
  label: string
  tone: BadgeTone
  /** Franja de color a la izquierda de la tarjeta para escanear la lista de un vistazo. */
  accent: string
  empty: string
}

export const BUCKET_META: Record<SubscriptionBucket, BucketMeta> = {
  expired_not_renewed: {
    label: 'Vencidas sin renovar',
    tone: 'danger',
    accent: 'border-l-danger',
    empty: 'No hay planes vencidos sin renovar este mes.',
  },
  balance_due: { label: 'Con saldo', tone: 'dorado', accent: 'border-l-dorado', empty: 'Nadie debe saldo en este mes.' },
  expiring_soon: { label: 'Por vencer', tone: 'warn', accent: 'border-l-warn', empty: 'Ningún plan está por vencer.' },
  no_plan: { label: 'Sin plan', tone: 'neutral', accent: 'border-l-line-strong', empty: 'Todas las alumnas tienen plan.' },
  ok: { label: 'Al día', tone: 'ok', accent: 'border-l-ok', empty: 'Aún nadie está al día este mes.' },
}

/** Color de cada situación para el borde y brillo del ticket móvil. */
export const BUCKET_COLOR: Record<SubscriptionBucket, string> = {
  expired_not_renewed: 'var(--color-danger)',
  balance_due: 'var(--color-dorado)',
  expiring_soon: 'var(--color-warn)',
  no_plan: 'var(--color-line-strong)',
  ok: 'var(--color-ok)',
}

export type PrimaryAction = 'renew' | 'pay' | 'assign' | null

/**
 * Plan desde el que se renueva: el del mes si existe (para alumnas por vencer) o el del mes anterior
 * cuando este mes todavía no tiene plan.
 */
export function getRenewSourceId(row: SubscriptionRow): string | null {
  return row.studentPlanId ?? row.prevStudentPlanId
}

/** La acción más probable de cada situación: es el botón grande de la fila. */
export function getPrimaryAction(row: SubscriptionRow): PrimaryAction {
  switch (row.bucket) {
    case 'expired_not_renewed':
    case 'expiring_soon':
      return getRenewSourceId(row) ? 'renew' : null
    case 'balance_due':
      return 'pay'
    case 'no_plan':
      return 'assign'
    case 'ok':
      return null
  }
}

/** "Vino hoy", "hace 12 días" o "Aún no ha asistido". */
export function describeLastAttended(lastAttendedAt: string | null): string {
  if (!lastAttendedAt) return 'Aún no ha asistido'
  const days = -daysUntil(lastAttendedAt)
  if (days <= 0) return 'Vino hoy'
  if (days === 1) return 'Vino ayer'
  return `Última clase hace ${days} días`
}

export function describeClasses(row: SubscriptionRow): string | null {
  if (row.classesTotal === null || row.classesRemaining === null) return null
  return `${row.classesRemaining} de ${row.classesTotal} ${row.classesTotal === 1 ? 'clase' : 'clases'}`
}
