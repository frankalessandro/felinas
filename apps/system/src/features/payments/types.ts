import type { Enums, Tables } from '@/types/database'

export type Payment = Tables<'payments'>
export type PaymentMethod = Enums<'payment_method'>

export type PaymentWithStudent = Payment & {
  student: { full_name: string | null; avatar_url: string | null } | null
}

export type PaymentStatus = 'free' | 'paid' | 'partial' | 'pending'
