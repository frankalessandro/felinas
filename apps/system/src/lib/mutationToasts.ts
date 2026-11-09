import { sileo } from 'sileo'
import { getErrorMessage } from '@/lib/errors'

export function toastSuccess(title: string, description?: string): void {
  sileo.success({ title, description })
}

/** Devuelve un handler `onError` para `useMutation` con el mensaje ya legible. */
export function toastError(title: string): (error: unknown) => void {
  return (error) => sileo.error({ title, description: getErrorMessage(error) })
}
