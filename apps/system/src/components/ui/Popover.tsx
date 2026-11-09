import * as RadixPopover from '@radix-ui/react-popover'
import type { ComponentProps } from 'react'
import { cn } from '@/lib/cn'

export const Popover = RadixPopover.Root
export const PopoverTrigger = RadixPopover.Trigger

export function PopoverContent({ className, sideOffset = 8, align = 'start', ...props }: ComponentProps<typeof RadixPopover.Content>) {
  return (
    <RadixPopover.Portal>
      <RadixPopover.Content
        sideOffset={sideOffset}
        align={align}
        className={cn('z-[60] w-72 rounded-2xl border border-line-strong bg-surface-2 p-4 text-sm shadow-card outline-none animate-fade-up', className)}
        {...props}
      />
    </RadixPopover.Portal>
  )
}
