import { firstName } from '@/features/birthdays/lib'
import type { AtRiskStudent } from './types'

/** "venía 2 veces/semana": `usual_weekly` es el promedio de las 4 semanas previas, redondeado y nunca menor a 1. */
export function describeUsualFrequency(usualWeekly: number): string {
  const times = Math.max(1, Math.round(Number(usualWeekly)))
  return times === 1 ? 'venía 1 vez/semana' : `venía ${times} veces/semana`
}

export function describeDaysSince(days: number): string {
  return days === 1 ? 'hace 1 día' : `hace ${days} días`
}

export function atRiskMessage(student: AtRiskStudent): string {
  return `Hola ${firstName(student.full_name)} 💖 te extrañamos en clase. Hace ${student.days_since} días que no te vemos por Felinas y queremos saber cómo estás. ¿Te esperamos esta semana? 🐆`
}
