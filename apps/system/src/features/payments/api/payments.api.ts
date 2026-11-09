import { supabase } from '@/lib/supabase'
import { AppError, unwrap } from '@/lib/errors'
import { RECEIPT_EXTENSIONS, RECEIPTS_BUCKET } from '../constants'
import type { RegisterPaymentData } from '../schemas'
import type { Payment, PaymentWithStudent } from '../types'

const WITH_STUDENT = '*, student:profiles!payments_student_id_fkey ( full_name, avatar_url )'
const SIGNED_URL_SECONDS = 600

export async function listStudentPayments(studentId: string): Promise<Payment[]> {
  return unwrap(
    await supabase
      .from('payments')
      .select('*')
      .eq('student_id', studentId)
      .order('paid_on', { ascending: false })
      .order('created_at', { ascending: false }),
  )
}

/** Pagos con fecha de pago dentro de [from, to] (yyyy-MM-dd), los más recientes primero. */
export async function listRecentPayments(from: string, to: string, limit: number): Promise<PaymentWithStudent[]> {
  return unwrap(
    await supabase
      .from('payments')
      .select(WITH_STUDENT)
      .gte('paid_on', from)
      .lte('paid_on', to)
      .order('paid_on', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(limit),
  )
}

async function uploadReceipt(studentId: string, file: File): Promise<string> {
  const extension = RECEIPT_EXTENSIONS[file.type]
  if (!extension) throw new AppError('El comprobante debe ser imagen o PDF.', 'INVALID_RECEIPT')
  const path = `${studentId}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from(RECEIPTS_BUCKET).upload(path, file, { contentType: file.type, upsert: false })
  if (error) throw new AppError('No se pudo subir el comprobante. Revisa tu conexión e intenta de nuevo.', 'RECEIPT_UPLOAD')
  return path
}

async function removeReceipt(path: string): Promise<void> {
  await supabase.storage.from(RECEIPTS_BUCKET).remove([path])
}

export interface RegisterPaymentInput {
  studentId: string
  studentPlanId: string | null
  data: RegisterPaymentData
  receipt: File | null
  /** Avisa en qué etapa va: subiendo el comprobante o guardando el pago. */
  onStage?: (stage: 'uploading' | 'saving') => void
}

/** Sube el comprobante (si hay) y registra el pago; si el pago falla, borra el archivo huérfano. */
export async function registerPayment({ studentId, studentPlanId, data, receipt, onStage }: RegisterPaymentInput): Promise<Payment> {
  let receiptPath: string | undefined
  if (receipt) {
    onStage?.('uploading')
    receiptPath = await uploadReceipt(studentId, receipt)
  }
  onStage?.('saving')
  const result = await supabase.rpc('register_payment', {
    p_student_id: studentId,
    p_amount: data.amount,
    p_method: data.method,
    p_student_plan_id: studentPlanId ?? undefined,
    p_paid_on: data.paid_on,
    p_reference: data.reference ?? undefined,
    p_notes: data.notes ?? undefined,
    p_receipt_path: receiptPath,
  })
  if (result.error && receiptPath) await removeReceipt(receiptPath)
  return unwrap(result)
}

export async function voidPayment(paymentId: string, reason: string): Promise<Payment> {
  return unwrap(await supabase.rpc('void_payment', { p_payment_id: paymentId, p_reason: reason }))
}

export async function setPlanPrice(studentPlanId: string, price: number, discountNote: string | null) {
  return unwrap(
    await supabase.rpc('set_plan_price', {
      p_student_plan_id: studentPlanId,
      p_price: price,
      p_discount_note: discountNote ?? undefined,
    }),
  )
}

export async function getReceiptUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(RECEIPTS_BUCKET).createSignedUrl(path, SIGNED_URL_SECONDS)
  if (error || !data) throw new AppError('No se pudo abrir el comprobante.', 'RECEIPT_URL')
  return data.signedUrl
}
