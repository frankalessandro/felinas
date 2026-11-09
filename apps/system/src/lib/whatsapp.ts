const COLOMBIA_COUNTRY_CODE = '57'
const COLOMBIA_LOCAL_LENGTH = 10
const MIN_INTERNATIONAL_LENGTH = 11

/** Número en formato internacional (solo dígitos) o null si no es utilizable. Los celulares de 10 dígitos reciben el 57. */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length === COLOMBIA_LOCAL_LENGTH) return `${COLOMBIA_COUNTRY_CODE}${digits}`
  if (digits.length >= MIN_INTERNATIONAL_LENGTH) return digits
  return null
}

/** Enlace `wa.me` con mensaje opcional ya escrito, o null si el teléfono no sirve. */
export function buildWhatsAppUrl(phone: string | null | undefined, message?: string): string | null {
  const number = toWhatsAppNumber(phone)
  if (!number) return null
  const suffix = message ? `?text=${encodeURIComponent(message)}` : ''
  return `https://wa.me/${number}${suffix}`
}

export function buildTelUrl(phone: string | null | undefined): string | null {
  const digits = phone?.replace(/\D/g, '')
  return digits ? `tel:${digits}` : null
}
