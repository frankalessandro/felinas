import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { IconButton } from './IconButton'

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  children?: ReactNode
  footer?: ReactNode
  className?: string
}

/** Modal centrado en escritorio; hoja inferior en móvil. */
export function Dialog({ open, onOpenChange, title, description, children, footer, className }: DialogProps) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-up" />
        <RadixDialog.Content
          className={cn(
            'fixed z-50 flex max-h-[90dvh] flex-col border border-line-strong bg-surface shadow-card outline-none',
            'inset-x-0 bottom-0 rounded-t-3xl pb-[env(safe-area-inset-bottom)]',
            'md:inset-x-auto md:bottom-auto md:left-1/2 md:top-1/2 md:w-full md:max-w-lg md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-2xl md:pb-0',
            'data-[state=open]:animate-fade-up',
            className,
          )}
        >
          <span aria-hidden className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong md:hidden" />
          <div className="flex items-start justify-between gap-4 p-5 pb-2">
            <div className="flex flex-col gap-1">
              <RadixDialog.Title className="font-display text-xl font-extrabold leading-tight">{title}</RadixDialog.Title>
              {description ? (
                <RadixDialog.Description className="text-sm text-fg-muted">{description}</RadixDialog.Description>
              ) : (
                <RadixDialog.Description className="sr-only">{title}</RadixDialog.Description>
              )}
            </div>
            <RadixDialog.Close asChild>
              <IconButton aria-label="Cerrar" className="-mr-2 -mt-2 shrink-0">
                <X className="size-5" aria-hidden />
              </IconButton>
            </RadixDialog.Close>
          </div>
          {children && <div className="overflow-y-auto px-5 py-3">{children}</div>}
          {footer && <div className="flex flex-col-reverse gap-2 p-5 pt-3 sm:flex-row sm:justify-end">{footer}</div>}
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}
