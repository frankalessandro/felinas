import type { MonthBirthday } from './types'

/** Primer nombre para saludar; cae a un fallback neutro si el perfil no lo tiene. */
export function firstName(fullName: string | null | undefined, fallback = 'Felina'): string {
  return fullName?.trim().split(/\s+/)[0] || fallback
}

export function birthdayMessage(fullName: string | null): string {
  return `¡Feliz cumpleaños ${firstName(fullName)}! 🎉🐆 Toda la familia Felinas te desea un día lleno de energía, baile y mucho amor. ¡Disfrútalo al máximo! 💖`
}

export function isBirthdayToday(birthday: MonthBirthday): boolean {
  return birthday.days_until === 0
}

export function describeDaysUntil(days: number): string {
  if (days === 0) return 'Hoy'
  if (days === 1) return 'Mañana'
  if (days === -1) return 'Ayer'
  if (days < 0) return `Hace ${-days} días`
  return `En ${days} días`
}
