import { Check, ListPlus, Lock, X } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'
import type { BookingEligibility } from '../eligibility'

interface BookingActionButtonProps {
  eligibility: BookingEligibility
  pending?: boolean
  onBook: () => void
  onCancel: () => void
  /** `card`: compacto dentro de la tarjeta. `sheet`: ancho completo en la hoja de detalle. */
  context?: 'card' | 'sheet'
}

export function BookingActionButton({ eligibility, pending = false, onBook, onCancel, context = 'card' }: BookingActionButtonProps) {
  const isSheet = context === 'sheet'
  const size = isSheet ? 'lg' : 'md'
  const layout = isSheet ? 'w-full sm:w-auto' : 'px-3'

  switch (eligibility.action) {
    case 'book':
      return (
        <Button size={size} className={layout} loading={pending} onClick={onBook}>
          Reservar
        </Button>
      )
    case 'waitlist':
      return (
        <Button
          size={size}
          variant="secondary"
          className={cn(layout, 'border-dorado/40 text-dorado hover:border-dorado hover:bg-dorado-soft')}
          loading={pending}
          onClick={onBook}
        >
          {!pending && <ListPlus className="size-4" aria-hidden />}
          {isSheet ? 'Unirme a lista de espera' : 'Lista de espera'}
        </Button>
      )
    case 'booked':
      return isSheet ? (
        <Button size={size} variant="danger" className={layout} onClick={onCancel}>
          <X className="size-4" aria-hidden />
          Cancelar reserva
        </Button>
      ) : (
        <Button
          size={size}
          variant="secondary"
          aria-label="Reservada. Toca para cancelar"
          className={cn(layout, 'border-ok/40 text-ok hover:border-ok hover:bg-ok-soft')}
          onClick={onCancel}
        >
          <Check className="size-4" aria-hidden />
          Reservada
        </Button>
      )
    case 'waitlisted':
      return isSheet ? (
        <Button size={size} variant="danger" className={layout} onClick={onCancel}>
          <X className="size-4" aria-hidden />
          Salir de la lista de espera
        </Button>
      ) : (
        <Button
          size={size}
          variant="secondary"
          aria-label={`${eligibility.label}. Toca para salir de la lista`}
          className={cn(layout, 'border-warn/40 text-warn hover:border-warn hover:bg-warn-soft')}
          onClick={onCancel}
        >
          {eligibility.label}
        </Button>
      )
    case 'unavailable':
      return (
        <Button size={size} variant="outline" className={cn(layout, 'border-line text-fg-subtle')} disabled>
          <Lock className="size-4" aria-hidden />
          No disponible
        </Button>
      )
  }
}
