import { useState, type FormEvent } from 'react'
import { Button, Dialog, Field, Textarea } from '@/components/ui'
import type { SessionWithDetails } from '@/features/schedule/types'
import { useCancelSession } from '../hooks/useSessionMutations'

const MIN_REASON_LENGTH = 3

interface CancelSessionFormProps {
  session: SessionWithDetails
  onClose: (cancelled: boolean) => void
}

function CancelSessionForm({ session, onClose }: CancelSessionFormProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string>()
  const cancel = useCancelSession()

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const trimmed = reason.trim()
    if (trimmed.length < MIN_REASON_LENGTH) {
      setError('Cuéntales el motivo a las alumnas.')
      return
    }
    try {
      await cancel.mutateAsync({ sessionId: session.id, reason: trimmed })
      onClose(true)
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  }

  const notified = session.booked_count + session.waitlist_count

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4" noValidate>
      <p className="rounded-xl bg-surface-2 p-3 text-sm text-fg-muted">
        {notified > 0
          ? `Se notificará a ${notified} ${notified === 1 ? 'alumna' : 'alumnas'} (reservadas y en lista de espera). `
          : 'Nadie tiene reserva en esta clase. '}
        <strong className="text-fg">No se descuenta ninguna clase de sus planes.</strong>
      </p>
      <Field label="Motivo de la cancelación" error={error} required>
        <Textarea
          rows={3}
          value={reason}
          maxLength={300}
          placeholder="Ej.: la profe está enferma, la reprogramamos pronto."
          onChange={(e) => {
            setReason(e.target.value)
            setError(undefined)
          }}
        />
      </Field>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="ghost" onClick={() => onClose(false)} disabled={cancel.isPending}>
          Volver
        </Button>
        <Button type="submit" variant="danger" loading={cancel.isPending}>
          Cancelar clase
        </Button>
      </div>
    </form>
  )
}

interface CancelSessionDialogProps {
  session: SessionWithDetails
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CancelSessionDialog({ session, open, onOpenChange }: CancelSessionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Cancelar clase" description="Esta acción avisa a las alumnas y no se puede deshacer.">
      <CancelSessionForm session={session} onClose={() => onOpenChange(false)} />
    </Dialog>
  )
}
