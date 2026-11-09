import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Ban, ClipboardCheck, DoorOpen, Pencil, User, UserPlus } from 'lucide-react'
import { Meter } from '@/components/brand'
import { AsyncContent, Badge, Button, buttonVariants, ConfirmDialog, Dialog, getCapacityTone } from '@/components/ui'
import { sessionQuery } from '@/features/schedule/queries'
import type { SessionWithDetails } from '@/features/schedule/types'
import { formatters, toDateKey } from '@/lib/dates'
import { useCancelBooking } from '../hooks/useSessionMutations'
import { sessionBookingsQuery } from '../queries'
import type { SessionBooking } from '../types'
import { AddStudentDialog } from './AddStudentDialog'
import { BookingList } from './BookingList'
import { CancelSessionDialog } from './CancelSessionDialog'

function SessionSummary({ session }: { session: SessionWithDetails }) {
  const color = session.class_type?.color ?? 'var(--color-rosa)'
  const cancelled = session.status === 'cancelled'
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-surface-2/60 p-4 pl-6">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Badge color={session.class_type?.color}>{session.class_type?.name ?? 'Clase'}</Badge>
            {session.kind === 'private' && <Badge tone="dorado">Personalizada</Badge>}
            {cancelled && <Badge tone="danger">Cancelada</Badge>}
          </div>
          <p className="mt-3 font-display text-2xl font-bold leading-none tabular-nums">{formatters.time(session.starts_at)}</p>
          <p className="mt-1.5 text-xs font-medium capitalize text-fg-muted">
            {formatters.fullDate(session.starts_at)} · hasta {formatters.time(session.ends_at)}
          </p>
        </div>
        <Meter
          value={session.booked_count}
          max={session.capacity}
          tone={getCapacityTone(session.booked_count, session.capacity)}
          label={`${session.booked_count} de ${session.capacity} cupos`}
          size={72}
        >
          <span className="text-center font-display text-sm font-bold leading-none tabular-nums">
            {session.booked_count}/{session.capacity}
            <span className="mt-0.5 block text-[10px] font-medium text-fg-muted">cupos</span>
          </span>
        </Meter>
      </div>
      <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-fg-muted">
        <span className="inline-flex items-center gap-1.5">
          <User className="size-4" aria-hidden />
          {session.teacher?.full_name ?? 'Sin profe'}
        </span>
        {session.room && (
          <span className="inline-flex items-center gap-1.5">
            <DoorOpen className="size-4" aria-hidden />
            Salón {session.room.name}
          </span>
        )}
        {session.waitlist_count > 0 && <span className="font-semibold text-warn">{session.waitlist_count} en lista de espera</span>}
      </p>
      {cancelled && session.cancel_reason && <p className="mt-3 rounded-xl bg-danger-soft p-3 text-sm text-fg">Motivo: {session.cancel_reason}</p>}
    </div>
  )
}

interface SessionActionsProps {
  session: SessionWithDetails
  onAdd: () => void
  onEdit: () => void
  onCancel: () => void
}

function SessionActions({ session, onAdd, onEdit, onCancel }: SessionActionsProps) {
  const isActive = session.status === 'scheduled'
  return (
    <div className="flex flex-wrap gap-2">
      {isActive && (
        <Button onClick={onAdd}>
          <UserPlus className="size-4" aria-hidden />
          Agregar alumna
        </Button>
      )}
      {isActive && (
        <>
          <Link
            to="/admin/attendance"
            search={{ day: toDateKey(session.starts_at), session: session.id }}
            className={buttonVariants({ variant: 'secondary' })}
          >
            <ClipboardCheck className="size-4" aria-hidden />
            Pasar lista
          </Link>
          <Button variant="secondary" onClick={onEdit}>
            <Pencil className="size-4" aria-hidden />
            Editar
          </Button>
          <Button variant="danger" onClick={onCancel}>
            <Ban className="size-4" aria-hidden />
            Cancelar clase
          </Button>
        </>
      )}
    </div>
  )
}

interface SessionDetailDialogProps {
  sessionId: string
  onClose: () => void
  onEdit: (session: SessionWithDetails) => void
  /** Abre de una vez el selector de alumna (tras crear una clase personalizada). */
  promptAddStudent?: boolean
}

export function SessionDetailDialog({ sessionId, onClose, onEdit, promptAddStudent = false }: SessionDetailDialogProps) {
  const session = useQuery(sessionQuery(sessionId))
  const bookings = useQuery(sessionBookingsQuery(sessionId))
  const cancelBooking = useCancelBooking()
  const [addOpen, setAddOpen] = useState(promptAddStudent)
  const [cancelOpen, setCancelOpen] = useState(false)
  const [bookingToCancel, setBookingToCancel] = useState<SessionBooking | null>(null)

  const data = session.data
  const bookedIds = new Set((bookings.data ?? []).map((b) => b.student_id))

  async function confirmCancelBooking() {
    if (!bookingToCancel) return
    try {
      await cancelBooking.mutateAsync(bookingToCancel.id)
    } catch {
      // El toast de error ya lo muestra el hook.
    }
  }

  return (
    <>
      <Dialog
        open
        onOpenChange={(open) => !open && onClose()}
        title={data?.title ?? data?.class_type?.name ?? 'Clase'}
        description="Detalle de la clase y sus reservas."
        className="md:max-w-2xl"
      >
        <AsyncContent isLoading={session.isLoading} error={session.error} onRetry={() => void session.refetch()}>
          {data && (
            <div className="flex flex-col gap-5 pb-2">
              <SessionSummary session={data} />
              <SessionActions session={data} onAdd={() => setAddOpen(true)} onEdit={() => onEdit(data)} onCancel={() => setCancelOpen(true)} />
              <AsyncContent isLoading={bookings.isLoading} error={bookings.error} onRetry={() => void bookings.refetch()}>
                <BookingList bookings={bookings.data ?? []} canCancel={data.status === 'scheduled'} onCancel={setBookingToCancel} />
              </AsyncContent>
            </div>
          )}
        </AsyncContent>
      </Dialog>

      {data && (
        <>
          <AddStudentDialog session={data} bookedStudentIds={bookedIds} open={addOpen} onOpenChange={setAddOpen} />
          <CancelSessionDialog session={data} open={cancelOpen} onOpenChange={setCancelOpen} />
          <ConfirmDialog
            open={bookingToCancel !== null}
            onOpenChange={(open) => !open && setBookingToCancel(null)}
            title="Cancelar reserva"
            description={`Se libera el cupo de ${bookingToCancel?.student?.full_name ?? 'la alumna'} y sube la primera de la lista de espera. No se descuenta ninguna clase.`}
            confirmLabel="Cancelar reserva"
            tone="danger"
            onConfirm={confirmCancelBooking}
          />
        </>
      )}
    </>
  )
}
