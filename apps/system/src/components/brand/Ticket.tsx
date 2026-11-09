import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TicketProps extends Omit<ComponentProps<'div'>, 'children'> {
  /** Color de acento (ej. el del tipo de clase). */
  color?: string
  children: ReactNode
  /** Talón del ticket: se muestra tras una línea troquelada (hora, cupos, acción). */
  stub?: ReactNode
  /** `row`: talón a la derecha (escritorio); `column`: talón abajo. */
  orientation?: 'row' | 'column'
}

/**
 * Tarjeta con forma de entrada de show: muescas laterales y talón troquelado.
 * Pensada para clases, eventos y la "próxima clase" de la alumna.
 */
export function Ticket({ color = 'var(--color-rosa)', children, stub, orientation = 'column', className, style, ...props }: TicketProps) {
  const isRow = orientation === 'row'
  return (
    <div
      className={cn(
        'relative flex overflow-hidden rounded-2xl bg-surface shadow-ticket',
        isRow ? 'flex-row' : 'flex-col ticket-notch',
        className,
      )}
      style={{ ...style, ['--ticket-color' as string]: color, ['--notch-y' as string]: stub ? 'calc(100% - 4.25rem)' : '50%' }}
      {...props}
    >
      <span aria-hidden className="absolute inset-y-0 left-0 w-1.5" style={{ background: color }} />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full opacity-25 blur-3xl"
        style={{ background: color }}
      />
      <div className="relative flex min-w-0 flex-1 flex-col gap-3 p-5 pl-6">{children}</div>
      {stub && (
        <div
          className={cn(
            'relative flex items-center gap-3 bg-surface-2/60 px-5 py-4 pl-6',
            isRow ? 'flex-col justify-center border-l-2 border-dashed border-line-strong' : 'border-t-2 border-dashed border-line-strong',
          )}
        >
          {stub}
        </div>
      )}
    </div>
  )
}
