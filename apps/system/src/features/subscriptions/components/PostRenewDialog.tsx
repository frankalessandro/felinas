import { CircleCheck } from 'lucide-react'
import { IconTile } from '@/components/brand'
import { Button, Dialog } from '@/components/ui'
import { formatters, fromDateKey } from '@/lib/dates'
import { formatCOP } from '@/lib/money'
import type { StudentPlanRow } from '../types'

interface PostRenewDialogProps {
  title?: string
  studentName: string
  planName: string
  renewed: StudentPlanRow
  onPay: () => void
  onClose: () => void
}

/** Justo después de renovar o asignar: el cobro suele ocurrir en el mismo momento, así que se ofrece registrarlo sin salir del flujo. */
export function PostRenewDialog({ title = 'Plan renovado', studentName, planName, renewed, onPay, onClose }: PostRenewDialogProps) {
  const price = renewed.price ?? 0
  return (
    <Dialog
      open
      onOpenChange={(open) => !open && onClose()}
      title={title}
      description={`${studentName} · ${planName}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Más tarde
          </Button>
          {price > 0 && (
            <Button onClick={onPay}>Registrar pago ahora</Button>
          )}
        </>
      }
    >
      <div className="flex items-start gap-3 rounded-2xl border border-ok/30 bg-ok-soft p-4">
        <IconTile icon={CircleCheck} tone="ok" />
        <div className="flex flex-col gap-1 text-sm">
          <p>
            Vigente hasta el <span className="font-semibold">{formatters.dayMonth(fromDateKey(renewed.expires_on))}</span>
            {renewed.classes_total !== null && <> con {renewed.classes_total} clases</>}.
          </p>
          <p className="text-fg-muted">
            {price > 0 ? (
              <>
                Valor a pagar: <span className="font-display font-bold tabular-nums text-ambar">{formatCOP(price)}</span>
              </>
            ) : (
              'El plan quedó sin valor a pagar.'
            )}
          </p>
        </div>
      </div>
    </Dialog>
  )
}
