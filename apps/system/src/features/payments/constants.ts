import type { PaymentMethod, PaymentStatus } from './types'

export const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'nequi', label: 'Nequi' },
  { value: 'daviplata', label: 'Daviplata' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'other', label: 'Otro' },
]

export function getMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHODS.find((item) => item.value === method)?.label ?? 'Otro'
}

export const RECEIPTS_BUCKET = 'payment-receipts'
export const RECEIPT_MAX_BYTES = 5 * 1024 * 1024

export const RECEIPT_EXTENSIONS: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'application/pdf': 'pdf',
}

export const RECEIPT_ACCEPT = Object.keys(RECEIPT_EXTENSIONS).join(',')

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, { label: string; tone: 'ok' | 'warn' | 'danger' | 'neutral' }> = {
  paid: { label: 'Pagado', tone: 'ok' },
  partial: { label: 'Abono', tone: 'warn' },
  pending: { label: 'Sin pagar', tone: 'danger' },
  free: { label: 'Sin costo', tone: 'neutral' },
}

export function toPaymentStatus(value: string | null | undefined): PaymentStatus | null {
  return value === 'paid' || value === 'partial' || value === 'pending' || value === 'free' ? value : null
}
