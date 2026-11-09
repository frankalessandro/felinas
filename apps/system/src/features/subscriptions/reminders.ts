import { formatters, fromDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import { monthName } from './months'
import type { MonthKey } from './months'
import type { SubscriptionRow } from './types'

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName
}

function dayMonth(dateKey: string): string {
  return formatters.dayMonth(fromDateKey(dateKey))
}

function pluralClasses(count: number): string {
  return count === 1 ? '1 clase' : `${count} clases`
}

function yourPlan(planName: string | null): string {
  return planName ? `tu plan ${planName}` : 'tu plan'
}

/**
 * Mensaje de cobro/renovación según la situación de la alumna. Devuelve `null` cuando no hay nada
 * que recordar (al día): el botón de WhatsApp queda sin texto precargado.
 */
export function buildReminderMessage(row: SubscriptionRow, month: MonthKey): string | null {
  const name = firstName(row.fullName)
  const plan = yourPlan(row.planName ?? row.prevPlanName)

  switch (row.bucket) {
    case 'expiring_soon': {
      const until = row.expiresOn ? `vence el ${dayMonth(row.expiresOn)}` : 'está por vencer'
      const remaining = row.classesRemaining !== null ? ` y te quedan ${pluralClasses(row.classesRemaining)}` : ''
      return `Hola ${name} 💖 ${plan} ${until}${remaining}. ¿Lo renovamos? 🐆`
    }
    case 'expired_not_renewed':
      return `Hola ${name} 💖 ${plan} ya terminó. ¿Lo renovamos para ${monthName(month)}? Te esperamos en clase 🐆`
    case 'balance_due': {
      const balance = row.balance !== null ? ` de ${formatCOP(row.balance)}` : ''
      return `Hola ${name} 💖 te recuerdo que tienes un saldo pendiente${balance} de ${plan}. ¿Me confirmas tu pago? Gracias 🐆`
    }
    case 'no_plan':
      return `Hola ${name} 💖 aún no tienes plan para ${monthName(month)}. ¿Te activo uno para que reserves tus clases? Cuéntame cuál prefieres 🐆`
    case 'ok':
      return null
  }
}

/** Aviso para cuando el plan del mes ya quedó renovado y listo para reservar. */
export function buildRenewedMessage(row: SubscriptionRow, month: MonthKey): string {
  const name = firstName(row.fullName)
  const classes = row.classesTotal !== null ? ` con ${pluralClasses(row.classesTotal)}` : ''
  const price = row.price ? ` El valor es ${formatCOP(row.price)}.` : ''
  return `Hola ${name} 💖 ya renové ${yourPlan(row.planName)} de ${monthName(month)}${classes}.${price} Ya puedes reservar tus clases en la app. ¡Nos vemos! 🐆`
}
