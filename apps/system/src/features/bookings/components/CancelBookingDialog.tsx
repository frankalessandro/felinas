import { ConfirmDialog } from '@/components/ui'
import { formatters } from '@/lib/dates'
import { useCancelBooking } from '../hooks/useBookingMutations'

export interface CancelTarget {
  bookingId: string
  title: string
  startsAt: string
  isWaitlist: boolean
}

interface CancelBookingDialogProps {
  target: CancelTarget | null
  onClose: () => void
}

export function CancelBookingDialog({ target, onClose }: CancelBookingDialogProps) {
  const cancel = useCancelBooking()
  const isWaitlist = target?.isWaitlist ?? false

  async function handleConfirm() {
    if (!target) return
    // El error ya se avisa con un toast; aquí solo evitamos una promesa rechazada sin manejar.
    await cancel.mutateAsync(target.bookingId).catch(() => undefined)
  }

  return (
    <ConfirmDialog
      open={target !== null}
      onOpenChange={(open) => !open && onClose()}
      title={isWaitlist ? '¿Salir de la lista de espera?' : '¿Cancelar tu reserva?'}
      description={
        target
          ? `${target.title} · ${formatters.fullDate(target.startsAt)}, ${formatters.time(target.startsAt)}. ${
              isWaitlist ? 'Perderás tu puesto en la lista.' : 'Es gratis y no se descuenta ninguna clase.'
            }`
          : undefined
      }
      confirmLabel={isWaitlist ? 'Sí, salir' : 'Sí, cancelar'}
      cancelLabel="Mantener"
      tone="danger"
      onConfirm={handleConfirm}
    />
  )
}
